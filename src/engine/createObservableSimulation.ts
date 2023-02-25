import {
	ConnectLine,
	Element,
	isCreationOperatorType,
	isPipeOperatorType,
	isSubscriberType,
} from '../model';
import { CreationNodeMissingError, SubscriberNodeMissingError } from './errors';
import { ObservableSimulation } from './ObservableSimulation';

interface ObservableStruct {
	creationElement: Element;
	subscriberElement: Element | null;
	pipeElements: Element[];
	connectLines: ConnectLine[];
	elements: Map<string, Element>;
}

interface ElementContext {
	elements: Map<string, Element>;
	connectLines: Map<string, ConnectLine[]>;
}

const createObservableExecutable = (creationElement: Element, ctx: ElementContext) => {
	const observableStruct: ObservableStruct = {
		creationElement,
		subscriberElement: null,
		pipeElements: [],
		connectLines: [],
		elements: new Map<string, Element>(),
	};
	let currentElement = creationElement;
	while (currentElement != null) {
		observableStruct.elements.set(currentElement.id, currentElement);

		const [cl] = ctx.connectLines.get(currentElement.id) ?? [];
		const nextElement = cl != null ? ctx.elements.get(cl.targetId) : null;
		if (!nextElement) {
			break;
		}

		if (isPipeOperatorType(nextElement.type)) {
			observableStruct.pipeElements.push(nextElement);
		} else if (isSubscriberType(nextElement.type)) {
			observableStruct.subscriberElement = nextElement;
		}
		observableStruct.connectLines.push(cl);

		currentElement = nextElement;
	}

	return observableStruct;
};

export const createObservableSimulation = (
	creationElementId: string,
	elements: Element[],
	cls: ConnectLine[],
) => {
	const connectLineMap = cls.reduce((map, cl) => {
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
		throw new CreationNodeMissingError(creationElementId);
	}

	const os = createObservableExecutable(creationElement, {
		elements: elementsMap,
		connectLines: connectLineMap,
	});

	if (!os.subscriberElement) {
		throw new SubscriberNodeMissingError();
	}

	return new ObservableSimulation({
		creationElement: os.creationElement,
		pipeElements: os.pipeElements,
		connectLines: os.connectLines,
		subscriberElement: os.subscriberElement,
		elements: os.elements,
	});
};
