import { ConnectLine, Element, isEntryOperatorType, isSubscriberType } from '../../model';
import { MissingNextElementError } from '../errors';

export enum GraphNodeType {
	Direct = 0,
	Reference = 1,
}

export interface GraphEdge {
	readonly id: string;
	readonly type: GraphNodeType;
	readonly sourceNodeId: string;
	readonly targetNodeId: string;
}

export interface GraphNode {
	readonly id: string;
	readonly edges: readonly GraphEdge[];
}

export interface GraphBranch {
	readonly nodes: readonly GraphNode[];
	readonly refNodeIds: ReadonlySet<string>;
}

export class SimulationGraph {
	constructor(
		private readonly elements: ReadonlyMap<string, Element>,
		private readonly cls: ReadonlyMap<string, ConnectLine[]>,
	) {}

	createObservableGraph(elementId: string): ReadonlyMap<string, GraphBranch> {
		const nodes = new Map<string, GraphBranch>();

		this.createGraph(elementId, nodes);
		return nodes;
	}

	createGraphNode(elId: string) {
		const el = this.elements.get(elId);
		if (!el) {
			throw new Error(`Element with id ${elId} was not found`);
		}

		return this.createGraphNodeForElement(el);
	}

	private createGraph(elementId: string, graphBranches: Map<string, GraphBranch>) {
		if (graphBranches.has(elementId)) {
			return;
		}

		const nodes = this.createGraphBranch(elementId);
		const refNodeIds = nodes
			.flatMap((node) => node.edges)
			.filter((edge) => edge.type === GraphNodeType.Reference)
			.reduce((edgeSet, edge) => edgeSet.add(edge.targetNodeId), new Set<string>());

		graphBranches.set(elementId, {
			nodes,
			refNodeIds,
		});

		for (const refNodeId of refNodeIds) {
			this.createGraph(refNodeId, graphBranches);
		}
	}

	private createGraphBranch(elId: string): GraphNode[] {
		const el = this.elements.get(elId);
		if (!el) {
			throw new Error(`Element with id ${elId} was not found`);
		}

		const isSubscriber = isSubscriberType(el.type);
		if (isSubscriber) {
			return [
				{
					id: el.id,
					edges: [],
				},
			];
		}

		const graphNode = this.createGraphNodeForElement(el);
		const directEdges = graphNode.edges.filter((edge) => edge.type === GraphNodeType.Direct);
		if (directEdges.length !== 1) {
			throw new MissingNextElementError(el.id, `Element ${el.id} has no next element`);
		}

		return [graphNode, ...this.createGraphBranch(directEdges[0].targetNodeId)];
	}

	private createGraphNodeForElement(el: Element) {
		const connectLines = this.cls.get(el.id) ?? [];
		const graphEdges: GraphEdge[] = connectLines.map((cl) => {
			const nextEl = this.elements.get(cl.target.id);
			if (!nextEl) {
				throw new Error(`Failed to find next element with id ${cl.target.id}`);
			}

			return {
				id: cl.id,
				sourceNodeId: el.id,
				targetNodeId: nextEl.id,
				type: isEntryOperatorType(nextEl.type)
					? GraphNodeType.Reference
					: GraphNodeType.Direct,
			};
		});

		return {
			id: el.id,
			edges: graphEdges,
		};
	}
}

