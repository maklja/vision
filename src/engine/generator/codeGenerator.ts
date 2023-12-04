import {
	ConnectLine,
	Element,
	ElementType,
	isCreationOperatorType,
	isEventPipeOperatorType,
} from '../../model';
import { GraphNodeType, SimulationGraph } from '../simulationGraph';

function createCreationCallback(el: Element, creationFactoryName: string) {
	switch (el.type) {
		case ElementType.Defer:
			return `function deferCallback() {
                return ${creationFactoryName};
            }`;
	}

	return null;
}

export function generateCreationFactoryName(el: Element) {
	const firstNameLetter = el.name[0];
	const otherNameLetters = el.name.slice(1);

	return `create${firstNameLetter.toUpperCase()}${otherNameLetters}`;
}

export function generateCreationCallbackCode(
	sourceElId: string,
	elements: ReadonlyMap<string, Element>,
	cls: ReadonlyMap<string, ConnectLine[]>,
): string | null {
	const sourceEl = elements.get(sourceElId);
	if (!sourceEl) {
		throw new Error(`Element with id ${sourceElId} not found`);
	}

	if (!isEventPipeOperatorType(sourceEl.type)) {
		return null;
	}

	const simGraph = new SimulationGraph(elements, cls);
	const sourceElNode = simGraph.createGraphNode(sourceEl.id);
	if (sourceEl.id !== sourceElNode?.id) {
		throw new Error(
			`Invalid entry node of the graph, expected ${sourceEl.id} received ${sourceElNode?.id}`,
		);
	}

	const refNodeEdges = sourceElNode.edges.filter((edge) => edge.type === GraphNodeType.Reference);
	const refNodesCreationCode: string[] = refNodeEdges.map((edge) => {
		const targetEl = elements.get(edge.targetNodeId);
		if (!targetEl) {
			throw new Error(`Element with id ${edge.targetNodeId} not found`);
		}

		if (isCreationOperatorType(targetEl.type)) {
			return `${generateCreationFactoryName(targetEl)}()`;
		}

		const creationFactoryParams =
			generateCreationCallbackCode(targetEl.id, elements, cls) ?? '';
		return `${generateCreationFactoryName(targetEl)}(${creationFactoryParams})`;
	});

	return createCreationCallback(sourceEl, refNodesCreationCode.join(', '));
}

