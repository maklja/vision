import {
	ConnectLine,
	ConnectLineCollection,
	Element,
	ElementType,
	MergeElement,
	isCreationOperatorType,
	isEventPipeOperatorType,
} from '../../model';
import { GraphNodeType, SimulationGraph } from '../simulationGraph';

export interface CodeNode {
	parentNode: Element;
	connectLine: ConnectLine | null;
	childNodes: CodeNode[];
}

export const FUNC_PARAMS_COMMA_SEPARATOR = ', ';

function createCreationCallback(node: CodeNode): string {
	const el = node.parentNode;
	const params = node.childNodes.map(createCreationCallback).join(FUNC_PARAMS_COMMA_SEPARATOR);

	if (el.type === ElementType.Defer) {
		const params = node.childNodes
			.map(createCreationCallback)
			.join(FUNC_PARAMS_COMMA_SEPARATOR);
		return `function deferCallback() {
			return ${params};
		}`;
	}

	if (el.type === ElementType.Interval) {
		const funcName = generateCreationFactoryName(el);
		return `${funcName}()`;
	}

	if (el.type === ElementType.Merge) {
		const mergeEl = el as MergeElement;
		const connectLine = node.childNodes.sort((n1, n2) => {
			const idx1 = n1.connectLine?.index ?? 0;
			const idx2 = n2.connectLine?.index ?? 0;

			return idx1 - idx2;
		});

		// const a = mergeEl.properties.
	}

	// switch (el.type) {
	// 	// case ElementType.Defer:
	// 	// case ElementType.Merge:
	// 	default:
	// 		return creationFactoryName;
	// }
	return '';
}

export function generateCreationFactoryName(el: Element) {
	const firstNameLetter = el.name[0];
	const otherNameLetters = el.name.slice(1);

	return `create${firstNameLetter.toUpperCase()}${otherNameLetters}`;
}

export function generateCreationCallbackNodes(
	sourceElId: string,
	elements: ReadonlyMap<string, Element>,
	connectLineCollection: ConnectLineCollection,
): CodeNode {
	const sourceEl = elements.get(sourceElId);
	if (!sourceEl) {
		throw new Error(`Element with id ${sourceElId} not found`);
	}

	if (!isEventPipeOperatorType(sourceEl.type)) {
		return {
			parentNode: sourceEl,
			connectLine: null,
			childNodes: [],
		};
	}

	const simGraph = new SimulationGraph(elements, connectLineCollection.connectLinesPath);
	const sourceElNode = simGraph.createGraphNode(sourceEl.id);
	if (sourceEl.id !== sourceElNode?.id) {
		throw new Error(
			`Invalid entry node of the graph, expected ${sourceEl.id} received ${sourceElNode?.id}`,
		);
	}

	const refNodeEdges = sourceElNode.edges.filter((edge) => edge.type === GraphNodeType.Reference);
	const refNodesCreationCode: CodeNode[] = refNodeEdges.map((edge) => {
		const targetEl = elements.get(edge.targetNodeId);
		if (!targetEl) {
			throw new Error(`Element with id ${edge.targetNodeId} not found`);
		}

		const connectLine = connectLineCollection.connectLines.get(edge.id);
		if (!connectLine) {
			throw new Error(`Connect line with id ${edge.id} not found`);
		}

		if (isCreationOperatorType(targetEl.type)) {
			return {
				parentNode: targetEl,
				connectLine,
				childNodes: [],
			}; //`${generateCreationFactoryName(targetEl)}()`;
		}

		// const creationFactoryParams =
		// 	generateCreationCallbackCode(targetEl.id, elements, cls) ?? '';
		// return `${generateCreationFactoryName(targetEl)}(${creationFactoryParams})`;
		return generateCreationCallbackNodes(targetEl.id, elements, connectLineCollection);
	});

	return {
		parentNode: sourceEl,
		connectLine: null,
		childNodes: refNodesCreationCode,
	};
}