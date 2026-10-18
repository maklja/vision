import { FlowTrace, TraceInvocation } from '../trace/FlowTrace';
import { validateReferences } from './utils';
import { ExecutionRun } from '../execution/ExecutionRun';
import { defer, catchError, Observable, ObservableInput, tap } from 'rxjs';
import {
	ConnectLine,
	Element,
	ElementProps,
	isCreationOperatorType,
	isEntryOperatorType,
	isJoinCreationOperatorType,
	isPipeOperatorType,
	isSubscriberType,
} from '@maklja/vision-simulator-model';
import { FlowManager, FlowValue, SimulationModel } from '../context';
import { creationOperatorFactory } from './creationOperatorFactory';
import { pipeOperatorFactory } from './pipeOperatorFactory';
import { GraphBranch, GraphNode, GraphNodeType } from '../simulationGraph';
import { joinCreationOperatorFactory } from './joinCreationOperatorFactory';
import {
	CreationObservableFactory,
	ObservableGeneratorProps,
	PipeObservableFactory,
} from './OperatorFactory';

interface RefObservable {
	observableGenerator: CreationObservableFactory;
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
	constructor(
		private readonly simulationModel: SimulationModel,
		private readonly flowManager: FlowManager,
		private readonly run = new ExecutionRun(),
		private readonly trace?: FlowTrace,
	) {}

	createObservable() {
		const { entryElementId } = this.simulationModel;

		const observableGenerators = new Map<string, CreationObservableFactory>();
		const graphBranchesDependencyQueue: string[] = [entryElementId];
		while (graphBranchesDependencyQueue.length > 0) {
			const curElId = graphBranchesDependencyQueue[0];
			const graphBranch = this.simulationModel.getGraphBranch(curElId);
			const missingNodeIds = [...graphBranch.refNodeIds].filter(
				(elId) => !observableGenerators.has(elId),
			);

			if (missingNodeIds.length > 0) {
				graphBranchesDependencyQueue.unshift(...missingNodeIds);
				continue;
			}

			observableGenerators.set(
				curElId,
				this.createBranchObservable(graphBranch, observableGenerators),
			);
			graphBranchesDependencyQueue.shift();
		}

		const mainObservableGenerator = observableGenerators.get(entryElementId);
		if (!mainObservableGenerator) {
			throw new Error(`Failed to generate observable for element with id ${entryElementId}`);
		}

		return mainObservableGenerator();
	}

	private createBranchObservable(
		graphBranch: GraphBranch,
		observableGenerators: Map<string, CreationObservableFactory>,
	): CreationObservableFactory {
		const { entryElementId } = this.simulationModel;
		const [creationNodePairs, pipeNodePairs] = graphBranch.nodes.reduce(
			([creationOperators, pipeOperators]: [GraphNodePair[], GraphNodePair[]], node) => {
				const element = this.simulationModel.getElement(node.id);
				const nodePair = {
					element,
					node,
				};
				return isEntryOperatorType(element.type)
					? [[...creationOperators, nodePair], pipeOperators]
					: [creationOperators, [...pipeOperators, nodePair]];
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
		const refObservables: RefObservable[] = this.getRefObservableGenerators(
			creationNodePair.node,
			observableGenerators,
		);

		this.createEntryOperator(creationNodePair.element, refObservables);
		for (const { element, node } of pipeNodePairs) {
			if (isPipeOperatorType(element.type))
				this.createPipeOperator(
					element,
					this.getRefObservableGenerators(node, observableGenerators),
				);
		}
		return (
			overrideParameters?: ElementProps,
			legacySubscribeId?: string,
			invocation?: TraceInvocation,
		) => {
			const build = (subscriptionId?: string) =>
				defer(() => {
					const creationObservableFactory = this.createEntryOperator(
						creationNodePair.element,
						this.getRefObservableGenerators(
							creationNodePair.node,
							observableGenerators,
							subscriptionId,
						),
						subscriptionId,
					);
					const creationPipeFactories = creationNodePair.node.edges
						.filter((edge) => edge.type === GraphNodeType.Direct)
						.flatMap((edge) => {
							const nextEl = this.simulationModel.getElement(edge.targetNodeId);
							const cl = this.simulationModel.getConnectLine(edge.id);
							const errorOperator =
								isMainGraphBranch && isSubscriberType(nextEl.type)
									? this.createUnhandledErrorOperator(cl)
									: this.createErrorTrackerOperator(cl);

							return [this.createControlOperator(cl), errorOperator];
						});
					const pipeFactories = pipeNodePairs.flatMap(({ element, node }) => {
						const refObservables: RefObservable[] = this.getRefObservableGenerators(
							node,
							observableGenerators,
							subscriptionId,
						);

						const pipeGenerators: PipeObservableFactory[] = [];
						if (isPipeOperatorType(element.type)) {
							pipeGenerators.push(
								this.createPipeOperator(element, refObservables, subscriptionId),
							);
						}

						return node.edges
							.filter((edge) => edge.type === GraphNodeType.Direct)
							.reduce((pipeGenerators, edge) => {
								const nextEl = this.simulationModel.getElement(edge.targetNodeId);
								const cl = this.simulationModel.getConnectLine(edge.id);
								const errorOperator =
									isMainGraphBranch && isSubscriberType(nextEl.type)
										? this.createUnhandledErrorOperator(cl)
										: this.createErrorTrackerOperator(cl);

								return [
									...pipeGenerators,
									this.createControlOperator(cl),
									errorOperator,
								];
							}, pipeGenerators);
					});
					const fullPipeFactories = [...creationPipeFactories, ...pipeFactories];

					return fullPipeFactories.reduce(
						(o, pipeFactory) => pipeFactory(o, subscriptionId),
						creationObservableFactory(overrideParameters, legacySubscribeId),
					);
				});
			return this.trace
				? this.trace.observe(creationNodePair.element.id, invocation, build)
				: build(legacySubscribeId);
		};
	}

	private createEntryOperator(
		el: Element,
		refObservables: RefObservable[],
		subscriptionId?: string,
	) {
		const refObservableGenerators: ObservableGeneratorProps[] = refObservables
			.map((refObservable) => ({
				connectPoint: refObservable.connectLine.source,
				connectLine: refObservable.connectLine,
				observableGenerator: refObservable.observableGenerator,
				onSubscribe: (value: FlowValue) =>
					this.flowManager.handleNextEvent(value, refObservable.connectLine),
			}))
			.sort((o1, o2) => o1.connectLine.index - o2.connectLine.index);

		validateReferences(el, { refObservableGenerators });
		if (isCreationOperatorType(el.type)) {
			return creationOperatorFactory.create(el, {
				refObservableGenerators,
				run: this.run,
				subscriptionId,
			});
		}

		if (isJoinCreationOperatorType(el.type)) {
			return joinCreationOperatorFactory.create(el, {
				refObservableGenerators,
				run: this.run,
				subscriptionId,
			});
		}

		throw new Error(`Unsupported entry operator type ${el.type}`);
	}

	private createPipeOperator(
		el: Element,
		refObservables: RefObservable[],
		subscriptionId?: string,
	) {
		const props = {
			run: this.run,
			subscriptionId,
			refObservableGenerators: refObservables
				.map((refObservable) => ({
					connectPoint: refObservable.connectLine.source,
					connectLine: refObservable.connectLine,
					observableGenerator: refObservable.observableGenerator,
					onSubscribe: (value: FlowValue) =>
						this.flowManager.handleNextEvent(value, refObservable.connectLine),
				}))
				.sort((o1, o2) => o1.connectLine.index - o2.connectLine.index),
		};
		validateReferences(el, props);
		return pipeOperatorFactory.create(el, props);
	}

	private getRefObservableGenerators(
		node: GraphNode,
		observables: Map<string, CreationObservableFactory>,
		subscriptionId?: string,
	): RefObservable[] {
		return node.edges
			.filter((edge) => edge.type === GraphNodeType.Reference)
			.map((refEdge) => {
				const refObservableGenerator = observables.get(refEdge.targetNodeId);
				const connectLine = this.simulationModel.getConnectLine(refEdge.id);
				if (!refObservableGenerator) {
					throw new Error(
						`Observable for element with id not found ${refEdge.targetNodeId}`,
					);
				}

				return {
					observableGenerator: (overrides, legacyId) =>
						refObservableGenerator(
							overrides,
							legacyId,
							subscriptionId
								? {
										parentSubscriptionId: subscriptionId,
										referenceLineId: connectLine.id,
										...(this.simulationModel.getElement(node.id).type === 'race'
											? { cancellationElementId: node.id }
											: {}),
									}
								: undefined,
						),
					connectLine,
				};
			});
	}

	private createControlOperator(cl: ConnectLine): PipeObservableFactory {
		return (o: Observable<FlowValue>, subscriptionId?: string) =>
			o.pipe(
				tap<FlowValue>((value) =>
					this.flowManager.handleNextEvent(value, cl, subscriptionId),
				),
			);
	}

	private createErrorTrackerOperator(cl: ConnectLine): PipeObservableFactory {
		return (o: Observable<FlowValue>, subscriptionId?: string) =>
			o.pipe(
				catchError<FlowValue, ObservableInput<FlowValue>>((error: unknown) => {
					const flowValueError =
						error instanceof FlowValue
							? error
							: FlowValue.createErrorEvent(error, cl.source.id, subscriptionId);
					this.flowManager.handleError(flowValueError, cl, subscriptionId);
					throw flowValueError;
				}),
			);
	}

	private createUnhandledErrorOperator(cl: ConnectLine): PipeObservableFactory {
		return (o: Observable<FlowValue>, subscriptionId?: string) =>
			o.pipe(
				catchError<FlowValue, ObservableInput<FlowValue>>((error: unknown) => {
					const flowValueError =
						error instanceof FlowValue
							? error
							: FlowValue.createErrorEvent(error, cl.source.id, subscriptionId);
					this.flowManager.handleFatalError(flowValueError, cl, subscriptionId);
					throw flowValueError;
				}),
			);
	}
}
