import { catchError, Observable, ObservableInput, tap } from 'rxjs';
import {
	ConnectLine,
	Element,
	ElementProps,
	isCreationOperatorType,
	isEntryOperatorType,
	isJoinCreationOperatorType,
	isPipeOperatorType,
	isSubscriberType,
} from '../../model';
import { FlowManager, FlowValue, FlowValueType, SimulationModel } from '../context';
import { creationOperatorFactory } from './DefaultCreationOperatorFactory';
import { DefaultPipeOperatorFactory } from './DefaultPipeOperatorFactory';
import { GraphBranch, GraphNode, GraphNodeType } from '../simulationGraph';
import { DefaultJoinCreationOperatorFactory } from './DefaultJoinCreationOperatorFactory';
import {
	CreationObservableFactory,
	CreationObservableGenerator,
	ObservableGeneratorProps,
	PipeObservableFactory,
	PipeObservableGenerator,
} from './OperatorFactory';

interface RefObservable {
	observableGenerator: CreationObservableGenerator;
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
	// private readonly joinCreationOperatorFactory = new DefaultJoinCreationOperatorFactory();
	private readonly pipeOperatorFactory = new DefaultPipeOperatorFactory();

	constructor(
		private readonly simulationModel: SimulationModel,
		private readonly flowManager: FlowManager,
	) {}

	createObservable() {
		const { entryElementId } = this.simulationModel;

		const observableGenerators = new Map<string, CreationObservableGenerator>();
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
		observableGenerators: Map<string, CreationObservableGenerator>,
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

		const creationObservableFactory = this.createEntryOperator(
			creationNodePair.element,
			refObservables,
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
			);

			const pipeGenerators: PipeObservableFactory[] = [];
			if (isPipeOperatorType(element.type)) {
				pipeGenerators.push(this.createPipeOperator(element, refObservables));
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

					return [...pipeGenerators, this.createControlOperator(cl), errorOperator];
				}, pipeGenerators);
		});
		const fullPipeFactories = [...creationPipeFactories, ...pipeFactories];

		return (overrideParameters?: ElementProps) =>
			fullPipeFactories.reduce(
				(o, pipeFactory) => pipeFactory(o),
				creationObservableFactory(overrideParameters),
			);
	}

	private createEntryOperator(el: Element, refObservables: RefObservable[]) {
		const refObservableGenerators: ObservableGeneratorProps[] = refObservables
			.map((refObservable) => ({
				connectPoint: refObservable.connectLine.source,
				connectLine: refObservable.connectLine,
				observableGenerator: refObservable.observableGenerator,
				onSubscribe: (value: FlowValue) =>
					this.flowManager.handleNextEvent(value, refObservable.connectLine),
			}))
			.sort((o1, o2) => o1.connectLine.index - o2.connectLine.index);

		if (isCreationOperatorType(el.type)) {
			return creationOperatorFactory.create(el, {
				refObservableGenerators: refObservableGenerators,
			});
		}

		// if (isJoinCreationOperatorType(el.type)) {
		// 	return this.joinCreationOperatorFactory.create(el, {
		// 		referenceObservables,
		// 	});
		// }

		throw new Error(`Unsupported entry operator type ${el.type}`);
	}

	private createPipeOperator(el: Element, refObservables: RefObservable[]) {
		return this.pipeOperatorFactory.create(el, {
			refObservableGenerators: refObservables
				.map((refObservable) => ({
					connectPoint: refObservable.connectLine.source,
					connectLine: refObservable.connectLine,
					observableGenerator: refObservable.observableGenerator,
					onSubscribe: (value: FlowValue) =>
						this.flowManager.handleNextEvent(value, refObservable.connectLine),
				}))
				.sort((o1, o2) => o1.connectLine.index - o2.connectLine.index),
		});
	}

	private getRefObservableGenerators(
		node: GraphNode,
		observables: Map<string, CreationObservableGenerator>,
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
					observableGenerator: refObservableGenerator,
					connectLine,
				};
			});
	}

	private createControlOperator(cl: ConnectLine): PipeObservableGenerator {
		return (o: Observable<FlowValue>) =>
			o.pipe(tap<FlowValue>((value) => this.flowManager.handleNextEvent(value, cl)));
	}

	private createErrorTrackerOperator(cl: ConnectLine): PipeObservableGenerator {
		return (o: Observable<FlowValue>) =>
			o.pipe(
				catchError<FlowValue, ObservableInput<FlowValue>>((error: unknown) => {
					const flowValueError =
						error instanceof FlowValue
							? error
							: new FlowValue(error, cl.source.id, FlowValueType.Error);
					this.flowManager.handleError(flowValueError, cl);
					throw flowValueError;
				}),
			);
	}

	private createUnhandledErrorOperator(cl: ConnectLine): PipeObservableGenerator {
		return (o: Observable<FlowValue>) =>
			o.pipe(
				catchError<FlowValue, ObservableInput<FlowValue>>((error: unknown) => {
					const flowValueError =
						error instanceof FlowValue
							? error
							: new FlowValue(error, cl.source.id, FlowValueType.Error);
					this.flowManager.handleFatalError(flowValueError, cl);
					throw flowValueError.raw;
				}),
			);
	}
}

