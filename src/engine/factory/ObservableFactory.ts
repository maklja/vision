import { catchError, Observable, ObservableInput, OperatorFunction, tap } from 'rxjs';
import {
	ConnectLine,
	Element,
	isCreationOperatorType,
	isPipeOperatorType,
	isSubscriberType,
} from '../../model';
import { FlowManager, FlowValue, SimulationModel } from '../context';
import { DefaultCreationOperatorFactory } from './DefaultCreationOperatorFactory';
import { DefaultPipeOperatorFactory } from './DefaultPipeOperatorFactory';
import { GraphBranch, GraphNode, GraphNodeType } from '../simulationGraph';

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

	constructor(
		private readonly simulationModel: SimulationModel,
		private readonly flowManager: FlowManager,
	) {}

	createObservable() {
		const { entryElementId } = this.simulationModel;

		const observables = new Map<string, Observable<FlowValue>>();
		const graphBranchesDependencyQueue: string[] = [entryElementId];
		while (graphBranchesDependencyQueue.length > 0) {
			const curElId = graphBranchesDependencyQueue[0];
			const graphBranch = this.simulationModel.getGraphBranch(curElId);

			const missingNodeIds = [...graphBranch.refNodeIds].filter(
				(elId) => !observables.has(elId),
			);
			if (missingNodeIds.length > 0) {
				graphBranchesDependencyQueue.unshift(...missingNodeIds);
				continue;
			}

			observables.set(curElId, this.createBranchObservable(graphBranch, observables));
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
		observables: Map<string, Observable<FlowValue>>,
	): Observable<FlowValue> {
		const pipeOperators: OperatorFunction<FlowValue, FlowValue>[] = [];

		let creationOperator: Observable<FlowValue<unknown>> | null = null;
		for (const currentNode of graphBranch.nodes) {
			const el = this.simulationModel.getElement(currentNode.id);
			const refObservables: ReferenceObservableData[] = this.getRefObservables(
				currentNode,
				observables,
			);

			if (isCreationOperatorType(el.type)) {
				creationOperator = this.createCreatorOperator(el, refObservables);
			} else if (isPipeOperatorType(el.type)) {
				pipeOperators.push(this.createPipeOperator(el, refObservables));
			}

			const clOperators = currentNode.edges
				.filter((edge) => edge.type === GraphNodeType.Direct)
				.flatMap((edge) => {
					const nextEl = this.simulationModel.getElement(edge.targetNodeId);
					return this.createConnectLinePipeOperators(
						nextEl,
						this.simulationModel.getConnectLine(edge.id),
					);
				});
			pipeOperators.push(...clOperators);
		}

		if (!creationOperator) {
			throw new Error('Creator operator was not found');
		}

		return creationOperator.pipe(...(pipeOperators as [])) as Observable<FlowValue>;
	}

	private createCreatorOperator(el: Element, refObservablesData: ReferenceObservableData[]) {
		return this.creationOperatorFactory.create(el, {
			referenceObservables: refObservablesData.map((refObservable) => ({
				connectPoint: refObservable.connectLine.source,
				observable: refObservable.observable,
				invokeTrigger: (value: FlowValue) =>
					this.flowManager.handleNextEvent(value, refObservable.connectLine),
			})),
		});
	}

	private createPipeOperator(el: Element, refObservablesData: ReferenceObservableData[]) {
		return this.pipeOperatorFactory.create(el, {
			referenceObservables: refObservablesData.map((refObservable) => ({
				connectPoint: refObservable.connectLine.source,
				observable: refObservable.observable,
				invokeTrigger: (value: FlowValue) =>
					this.flowManager.handleNextEvent(value, refObservable.connectLine),
			})),
		});
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

	private getRefObservables(
		node: GraphNode,
		observables: Map<string, Observable<FlowValue>>,
	): ReferenceObservableData[] {
		return node.edges
			.filter((edge) => edge.type === GraphNodeType.Reference)
			.map((refEdge) => {
				const refObservable = observables.get(refEdge.targetNodeId);
				const connectLine = this.simulationModel.getConnectLine(refEdge.id);
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

