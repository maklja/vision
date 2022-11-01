import { ConnectLine, Element, isCreationOperatorType, isPipeOperatorType } from '../model';

interface ObservableStruct {
	creationElement: Element | null;
	subscriberElement: Element;
	pipeElements: Element[];
	connectLines: ConnectLine[];
}

interface ElementContext {
	elements: Map<string, Element>;
	connectLines: Map<string, ConnectLine[]>;
}

export const createObservableExecutable = (subscriberElement: Element, ctx: ElementContext) => {
	const observableStruct: ObservableStruct = {
		subscriberElement,
		creationElement: null,
		pipeElements: [],
		connectLines: [],
	};
	let currentElement = subscriberElement;
	while (currentElement != null) {
		const [cl] = ctx.connectLines.get(currentElement.id) ?? [];
		const nextElement = cl ? ctx.elements.get(cl.sourceId) : null;
		if (!nextElement) {
			break;
		}

		if (isPipeOperatorType(nextElement.type)) {
			observableStruct.pipeElements.unshift(nextElement);
		} else if (isCreationOperatorType(nextElement.type)) {
			observableStruct.creationElement = nextElement;
		}
		observableStruct.connectLines.unshift(cl);

		currentElement = nextElement;
	}

	return observableStruct;
};

