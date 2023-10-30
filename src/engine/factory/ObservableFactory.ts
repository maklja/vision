import { catchError, Observable, ObservableInput, OperatorFunction, tap } from 'rxjs';
import {
	ConnectLine,
	Element,
	isCreationOperatorType,
	isEntryOperatorType,
	isJoinCreationOperatorType,
	isPipeOperatorType,
	isSubscriberType,
} from '../../model';
import { FlowManager, FlowValue, FlowValueType, SimulationModel } from '../context';
import { DefaultCreationOperatorFactory } from './DefaultCreationOperatorFactory';
import { DefaultPipeOperatorFactory } from './DefaultPipeOperatorFactory';
import { GraphBranch, GraphNode, GraphNodeType } from '../simulationGraph';
import { DefaultJoinCreationOperatorFactory } from './DefaultJoinCreationOperatorFactory';

interface ReferenceObservableData {
	observable: Observable<FlowValue>;
	connectLine: ConnectLine;
}

interface GraphNodePair {
	node: GraphNode;
	element: Element;
}

export interface CreateObservableParams {
	creationElement: Element;
	subscriberElement: Element;
	pipeElements: Element[];
	connectLines: ConnectLine[];
	elements: Map<string, Element>;
}

export class ObservableFactory {
	private readonly joinCreationOperatorFactory = new DefaultJoinCreationOperatorFactory();
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
		const { entryElementId } = this.simulationModel;

		const [creationNodePairs, pipeNodePairs] = graphBranch.nodes.reduce(
			([creationOperators, pipeOperators]: [GraphNodePair[], GraphNodePair[]], node) => {
				const element = this.simulationModel.getElement(node.id);
				return isEntryOperatorType(element.type)
					? [
							[
								...creationOperators,
								{
									element,
									node,
								},
							],
							pipeOperators,
					  ]
					: [
							creationOperators,
							[
								...pipeOperators,
								{
									element,
									node,
								},
							],
					  ];
			},
			[[], []],
		);

		if (creationNodePairs.length === 0) {
			throw new Error('Entry node not found');
		}

		if (creationNodePairs.length > 1) {
			throw new Error('Multiple creation nodes found');
		}

		const creationNodePair = creationNodePairs[0];
		const isMainGraphBranch = creationNodePair.element.id === entryElementId;
		const refObservables: ReferenceObservableData[] = this.getRefObservables(
			creationNodePair.node,
			observables,
		);
		const creationOperator = creationNodePair.node.edges
			.filter((edge) => edge.type === GraphNodeType.Direct)
			.reduce((o, edge) => {
				const nextEl = this.simulationModel.getElement(edge.targetNodeId);
				const cl = this.simulationModel.getConnectLine(edge.id);
				if (isMainGraphBranch && isSubscriberType(nextEl.type)) {
					return o.pipe(
						this.createControlOperator(cl),
						this.createUnhandledErrorOperator(cl),
					);
				}

				return o.pipe(this.createControlOperator(cl), this.createErrorTrackerOperator(cl));
			}, this.createEntryOperator(creationNodePair.element, refObservables));

		return pipeNodePairs.reduce((observable, { element, node }) => {
			const refObservables: ReferenceObservableData[] = this.getRefObservables(
				node,
				observables,
			);

			if (isPipeOperatorType(element.type)) {
				observable = this.createPipeOperator(observable, element, refObservables);
			}

			return node.edges
				.filter((edge) => edge.type === GraphNodeType.Direct)
				.reduce((o, edge) => {
					const nextEl = this.simulationModel.getElement(edge.targetNodeId);
					const cl = this.simulationModel.getConnectLine(edge.id);
					if (isMainGraphBranch && isSubscriberType(nextEl.type)) {
						return o.pipe(
							this.createControlOperator(cl),
							this.createUnhandledErrorOperator(cl),
						);
					}

					return o.pipe(
						this.createControlOperator(cl),
						this.createErrorTrackerOperator(cl),
					);
				}, observable);
		}, creationOperator);
	}

	private createEntryOperator(el: Element, refObservablesData: ReferenceObservableData[]) {
		const referenceObservables = refObservablesData
			.map((refObservable) => ({
				connectPoint: refObservable.connectLine.source,
				connectLine: refObservable.connectLine,
				observable: refObservable.observable,
				invokeTrigger: (value: FlowValue) =>
					this.flowManager.handleNextEvent(value, refObservable.connectLine),
			}))
			.sort((o1, o2) => o1.connectLine.index - o2.connectLine.index);

		if (isCreationOperatorType(el.type)) {
			return this.creationOperatorFactory.create(el, {
				referenceObservables,
			});
		}

		if (isJoinCreationOperatorType(el.type)) {
			return this.joinCreationOperatorFactory.create(el, {
				referenceObservables,
			});
		}

		throw new Error(`Unsupported entry operator type ${el.type}`);
	}

	private createPipeOperator(
		observable: Observable<FlowValue>,
		element: Element,
		refObservablesData: ReferenceObservableData[],
	) {
		const options = {
			referenceObservables: refObservablesData
				.map((refObservable) => ({
					connectPoint: refObservable.connectLine.source,
					connectLine: refObservable.connectLine,
					observable: refObservable.observable,
					invokeTrigger: (value: FlowValue) =>
						this.flowManager.handleNextEvent(value, refObservable.connectLine),
				}))
				.sort((o1, o2) => o1.connectLine.index - o2.connectLine.index),
		};
		return this.pipeOperatorFactory.create({
			observable,
			element,
			options,
			context: {},
		});
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
			const flowValueError =
				error instanceof FlowValue
					? error
					: new FlowValue(error, cl.source.id, FlowValueType.Error);
			this.flowManager.handleError(flowValueError, cl);
			throw flowValueError;
		});
	}

	private createUnhandledErrorOperator(cl: ConnectLine) {
		return catchError<FlowValue, ObservableInput<FlowValue>>((error: unknown) => {
			const flowValueError =
				error instanceof FlowValue
					? error
					: new FlowValue(error, cl.source.id, FlowValueType.Error);
			this.flowManager.handleFatalError(flowValueError, cl);
			throw flowValueError.raw;
		});
	}
}

