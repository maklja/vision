import { ConnectLine, Element, isCreationOperatorType } from '../model';
import { createObservableExecutable } from './createObservableExecutable';
import { ObservableSimulation } from './ObservableSimulation';

export const createObservableSimulation = <T = unknown>(
	creationElementId: string,
	elements: Element[],
	cls: ConnectLine[],
) => {
	const connectLineMap = cls.reduce((map, cl) => {
		if (!cl.targetId) {
			return map;
		}

		const cls = map.get(cl.sourceId) ?? [];
		return map.set(cl.sourceId, [...cls, cl]);
	}, new Map<string, ConnectLine[]>());

	const elementsMap = elements.reduce(
		(map, element) => map.set(element.id, element),
		new Map<string, Element>(),
	);

	const creationElement = elements.find(
		(el) => el.id === creationElementId && isCreationOperatorType(el.type),
	);

	if (!creationElement) {
		return null;
	}

	const os = createObservableExecutable(creationElement, {
		elements: elementsMap,
		connectLines: connectLineMap,
	});

	if (!os.subscriberElement) {
		return null;
	}

	return new ObservableSimulation<T>({
		creationElement: os.creationElement,
		pipeElements: os.pipeElements,
		connectLines: os.connectLines,
		subscriberElement: os.subscriberElement,
	});
};

