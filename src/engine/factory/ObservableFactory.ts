import { catchError, Observable, ObservableInput, OperatorFunction, tap } from 'rxjs';
import { ConnectLine, Element, isPipeOperatorType, isSubscriberType } from '../../model';
import { FlowManager, FlowValue, SimulationModel } from '../context';
import { DefaultCreationOperatorFactory } from './DefaultCreationOperatorFactory';
import { DefaultPipeOperatorFactory } from './DefaultPipeOperatorFactory';
import { GraphBranch, GraphNodeType } from '../simulationGraph';

export interface CreateObservableParams {
	creationElement: Element;
	subscriberElement: Element;
	pipeElements: Element[];
	connectLines: ConnectLine[];
	elements: Map<string, Element>;
}

export class ObservableFactory {
	private readonly creationOperatorFactory = new DefaultCreationOperatorFactory();
	private readonly pipeOperatorFactory = new DefaultPipeOperatorFactory();

	constructor(private readonly flowManager: FlowManager) {}

	createObservable(simulationModel: SimulationModel) {
		const { entryElementId, graphBranches } = simulationModel;

		const observables = new Map<string, Observable<FlowValue>>();
		const graphBranchesDependencyQueue: string[] = [entryElementId];
		while (graphBranchesDependencyQueue.length > 0) {
			const curElId = graphBranchesDependencyQueue[0];
			const graphBranch = graphBranches.get(curElId);
			if (!graphBranch) {
				throw new Error(`Unable to find graph branch for element with id ${curElId}`);
			}

			const missingNodeIds = [...graphBranch.refNodeIds].filter(
				(elId) => !observables.has(elId),
			);
			if (missingNodeIds.length > 0) {
				graphBranchesDependencyQueue.unshift(...missingNodeIds);
				continue;
			}

			observables.set(
				curElId,
				this.createBranchObservable(graphBranch, simulationModel, observables),
			);
			graphBranchesDependencyQueue.shift();
		}

		const mainObservable = observables.get(entryElementId);
		if (!mainObservable) {
			throw new Error(`Failed to generate observable for element with id ${entryElementId}`);
		}

		return mainObservable;
	}

	private createBranchObservable(
		graphBranch: GraphBranch,
		simulationModel: SimulationModel,
		observables: Map<string, Observable<FlowValue>>,
	): Observable<FlowValue> {
		const startNode = graphBranch.nodes[0];
		const { elements, connectLines } = simulationModel;
		const creationElement = elements.get(startNode.id);

		if (!creationElement) {
			throw new Error(`Element with id ${startNode.id} not found`);
		}

		const observable = this.creationOperatorFactory.create(creationElement);
		const pipeOperators: OperatorFunction<FlowValue, FlowValue>[] = [];

		for (const currentNode of graphBranch.nodes) {
			const el = elements.get(currentNode.id);
			if (!el) {
				throw new Error(`Element with id ${currentNode.id} not found`);
			}

			const refObservables = currentNode.edges
				.filter((edge) => edge.type === GraphNodeType.Reference)
				.map((refEdge) => {
					const refObservable = observables.get(refEdge.targetNodeId);
					if (!refObservable) {
						throw new Error(
							`Observable for element with id not found ${refEdge.targetNodeId}`,
						);
					}

					return refObservable;
				});
			const operator = this.createOperator(el, refObservables);
			if (operator) {
				pipeOperators.push(operator);
			}

			const clOperators = currentNode.edges
				.filter((edge) => edge.type === GraphNodeType.Direct)
				.flatMap((edge) => {
					const cl = connectLines.get(edge.id);
					if (!cl) {
						throw new Error(`Connection line with ${edge.id} id was not found`);
					}

					return this.createConnectLinePipeOperators(el, cl);
				});
			pipeOperators.push(...clOperators);
		}

		return observable.pipe(...(pipeOperators as [])) as Observable<FlowValue>;
	}

	private createOperator(el: Element, referenceObservables: Observable<FlowValue>[]) {
		if (!isPipeOperatorType(el.type)) {
			return null;
		}

		return this.pipeOperatorFactory.create(el, {
			referenceObservables,
		});
	}

	private createConnectLinePipeOperators(
		el: Element,
		cl: ConnectLine,
	): OperatorFunction<FlowValue, FlowValue>[] {
		const pipeOperators: OperatorFunction<FlowValue, FlowValue>[] = [];
		if (isSubscriberType(el.type)) {
			pipeOperators.push(
				this.createControlOperator(cl),
				this.createUnhandledErrorOperator(cl),
			);
		} else {
			pipeOperators.push(this.createControlOperator(cl), this.createErrorTrackerOperator(cl));
		}

		return pipeOperators;
	}

	private createControlOperator(cl: ConnectLine) {
		return tap<FlowValue>((value) => this.flowManager.handleNextEvent(value, cl));
	}

	private createErrorTrackerOperator(cl: ConnectLine): OperatorFunction<FlowValue, FlowValue> {
		return catchError<FlowValue, ObservableInput<FlowValue>>((error: unknown) => {
			const flowValueError = error instanceof FlowValue ? error : new FlowValue(error);
			this.flowManager.handleError(flowValueError, cl);
			throw flowValueError;
		});
	}

	private createUnhandledErrorOperator(cl: ConnectLine) {
		return catchError<FlowValue, ObservableInput<FlowValue>>((error: unknown) => {
			const flowValueError = error instanceof FlowValue ? error : new FlowValue(error);
			this.flowManager.handleFatalError(flowValueError, cl);
			throw flowValueError.value;
		});
	}
}

