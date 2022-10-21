import { Observable } from 'rxjs';
import { ConnectLine, Element, creationOperators, ElementType } from '../model';
import { creationElementsFactory } from './factory';

const subscribeToObservable = (o: Observable<unknown>) =>
	o.subscribe({
		next: (val) => console.log(val),
		error: (error) => console.log(error),
		complete: () => console.log('complete'),
	});

const executeObservable = (elements: Element[]) => {
	const o = creationElementsFactory(elements.shift()!);

	elements.forEach((element) => {
		switch (element.type) {
			case ElementType.Subscriber:
				subscribeToObservable(o!);
		}
	});
};

const createPipe = (
	operatorElement: Element,
	operatorElements: Map<string, Element>,
	connectLineMap: Map<string, string[]>,
): Element[] => {
	const operatorConnectElements = connectLineMap.get(operatorElement.id) ?? [];
	if (operatorConnectElements.length === 0) {
		return [operatorElement];
	}

	const connectedOperators = operatorConnectElements
		.map((elementId) => operatorElements.get(elementId))
		.filter((element): element is Element => Boolean(element))
		.flatMap((element) => createPipe(element, operatorElements, connectLineMap));

	return [operatorElement, ...connectedOperators];
};

export const engine = (elements: Element[], cls: ConnectLine[]) => {
	const connectLineMap = cls.reduce((map, cl) => {
		if (!cl.targetId) {
			return map;
		}

		const targetIds = map.get(cl.sourceId) ?? [];
		return map.set(cl.sourceId, [...targetIds, cl.targetId]);
	}, new Map<string, string[]>());

	const operatorElementsMap = elements.reduce(
		(map, element) =>
			!creationOperators.includes(element.type) ? map.set(element.id, element) : map,
		new Map<string, Element>(),
	);

	const creationOperatorElements = elements.filter((element) =>
		creationOperators.includes(element.type),
	);

	creationOperatorElements.forEach((creationElement) => {
		console.log(createPipe(creationElement, operatorElementsMap, connectLineMap));
		executeObservable(createPipe(creationElement, operatorElementsMap, connectLineMap));
	});
};

