import { ConnectLine, Element, isPipeOperatorType, isSubscriberType } from '../model';

interface ObservableStruct {
	creationElement: Element;
	subscriberElement: Element | null;
	pipeElements: Element[];
	connectLines: ConnectLine[];
}

interface ElementContext {
	elements: Map<string, Element>;
	connectLines: Map<string, ConnectLine[]>;
}

export const createObservableExecutable = (creationElement: Element, ctx: ElementContext) => {
	const observableStruct: ObservableStruct = {
		creationElement,
		subscriberElement: null,
		pipeElements: [],
		connectLines: [],
	};
	let currentElement = creationElement;
	while (currentElement != null) {
		const [cl] = ctx.connectLines.get(currentElement.id) ?? [];
		const nextElement = cl?.targetId != null ? ctx.elements.get(cl.targetId) : null;
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

