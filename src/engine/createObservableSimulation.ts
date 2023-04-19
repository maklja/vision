import {
	ConnectLine,
	Element,
	isCreationOperatorType,
	isPipeOperatorType,
	isSubscriberType,
} from '../model';
import { SimulationModel } from './context';
import { CreationNodeMissingError, SubscriberNodeMissingError } from './errors';
import { ObservableSimulation } from './ObservableSimulation';

const createSimulationModel = (
	creationElementId: string,
	elements: Element[],
	cls: ConnectLine[],
): SimulationModel => {
	const elementsMap = elements.reduce(
		(map, element) => map.set(element.id, element),
		new Map<string, Element>(),
	);

	const creationElement = elementsMap.get(creationElementId);

	if (!creationElement || !isCreationOperatorType(creationElement.type)) {
		throw new CreationNodeMissingError(creationElementId);
	}

	const connectLinePath = cls.reduce((map, cl) => {
		const cls = map.get(cl.sourceId) ?? [];
		return map.set(cl.sourceId, [...cls, cl]);
	}, new Map<string, ConnectLine[]>());

	const simElements = new Map<string, Element>();
	const simConnectLines = new Map<string, ConnectLine>();
	const simPipeElements: Element<unknown>[] = [];
	let subscriberElement: Element<unknown> | null = null;
	let currentElement = creationElement;
	while (currentElement != null) {
		simElements.set(currentElement.id, currentElement);

		const [cl] = connectLinePath.get(currentElement.id) ?? [];
		const nextElement = cl != null ? elementsMap.get(cl.targetId) : null;
		if (!nextElement) {
			break;
		}

		simConnectLines.set(cl.id, cl);

		if (isPipeOperatorType(nextElement.type)) {
			simPipeElements.push(nextElement);
		} else if (isSubscriberType(nextElement.type)) {
			subscriberElement = nextElement;
		}

		currentElement = nextElement;
	}

	if (!subscriberElement) {
		throw new SubscriberNodeMissingError();
	}

	return {
		creationElement,
		subscriberElement,
		elements: simElements,
		connectLines: simConnectLines,
		pipeElements: simPipeElements,
	};
};

export const createObservableSimulation = (
	creationElementId: string,
	elements: Element[],
	cls: ConnectLine[],
) => {
	return new ObservableSimulation(createSimulationModel(creationElementId, elements, cls));
};
