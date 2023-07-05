import { catchError, Observable, ObservableInput, OperatorFunction, tap } from 'rxjs';
import { ConnectLine, Element, isPipeOperatorType, isSubscriberType } from '../../model';
import { FlowManager, FlowValue, SimulationModel } from '../context';
import { DefaultCreationOperatorFactory } from './DefaultCreationOperatorFactory';
import { DefaultPipeOperatorFactory } from './DefaultPipeOperatorFactory';
import { GraphBranch, GraphNodeType } from '../simulationGraph';

interface ReferenceObservableData {
	observable: Observable<FlowValue>;
	connectLine: ConnectLine;
}

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
		const { entryElementId } = simulationModel;

		const observables = new Map<string, Observable<FlowValue>>();
		const graphBranchesDependencyQueue: string[] = [entryElementId];
		while (graphBranchesDependencyQueue.length > 0) {
			const curElId = graphBranchesDependencyQueue[0];
			const graphBranch = simulationModel.getGraphBranch(curElId);

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
		const creationElement = simulationModel.getElement(startNode.id);
		const observable = this.creationOperatorFactory.create(creationElement);
		const pipeOperators: OperatorFunction<FlowValue, FlowValue>[] = [];

		for (const currentNode of graphBranch.nodes) {
			const el = simulationModel.getElement(currentNode.id);
			const refObservables: ReferenceObservableData[] = currentNode.edges
				.filter((edge) => edge.type === GraphNodeType.Reference)
				.map((refEdge) => {
					const refObservable = observables.get(refEdge.targetNodeId);
					const connectLine = simulationModel.getConnectLine(refEdge.id);
					if (!refObservable) {
						throw new Error(
							`Observable for element with id not found ${refEdge.targetNodeId}`,
						);
					}

					return {
						observable: refObservable,
						connectLine,
					};
				});
			const operator = this.createOperator(el, refObservables);
			pipeOperators.push(...operator);

			const clOperators = currentNode.edges
				.filter((edge) => edge.type === GraphNodeType.Direct)
				.flatMap((edge) => {
					const nextEl = simulationModel.getElement(edge.targetNodeId);
					return this.createConnectLinePipeOperators(
						nextEl,
						simulationModel.getConnectLine(edge.id),
					);
				});
			pipeOperators.push(...clOperators);
		}

		return observable.pipe(...(pipeOperators as [])) as Observable<FlowValue>;
	}

	private createOperator(el: Element, refObservablesData: ReferenceObservableData[]) {
		if (isPipeOperatorType(el.type)) {
			return [
				this.pipeOperatorFactory.create(el, {
					referenceObservables: refObservablesData.map((refObservable) => ({
						observable: refObservable.observable,
						invokeTrigger: (value: FlowValue) =>
							this.flowManager.handleNextEvent(value, refObservable.connectLine),
					})),
				}),
			];
		}

		return [];
	}

	private createConnectLinePipeOperators(
		el: Element,
		cl: ConnectLine,
	): OperatorFunction<FlowValue, FlowValue>[] {
		if (isSubscriberType(el.type)) {
			return [this.createControlOperator(cl), this.createUnhandledErrorOperator(cl)];
		}

		return [this.createControlOperator(cl), this.createErrorTrackerOperator(cl)];
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

