import { Element, ElementType, isCreationOperatorType, isEventPipeOperatorType } from '../../model';
import { GraphBranch, GraphNodeType } from '../simulationGraph';

function createCreationCallback(el: Element, creationFactoryName: string) {
	switch (el.type) {
		case ElementType.Defer:
			return `function() {
                return ${creationFactoryName}();
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
	graph: ReadonlyMap<string, GraphBranch>,
	elements: ReadonlyMap<string, Element>,
): string | null {
	const sourceEl = elements.get(sourceElId);
	if (!sourceEl) {
		throw new Error(`Element with id ${sourceElId} not found`);
	}

	if (!isEventPipeOperatorType(sourceEl.type)) {
		return null;
	}

	const graphBranch = graph.get(sourceEl.id);
	if (!graphBranch) {
		throw new Error(`Missing graph branch for element ${sourceEl.id}`);
	}

	const [sourceElNode] = graphBranch.nodes;
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
			generateCreationCallbackCode(targetEl.id, graph, elements) ?? '';
		return `${generateCreationFactoryName(targetEl)}(${creationFactoryParams})`;
	});

	return createCreationCallback(sourceEl, refNodesCreationCode.join(', '));
}
