import { concatMap, from, Observable } from 'rxjs';
import {
	ConnectLine,
	Element,
	isSubscriberType,
	isPipeOperatorType,
	isCreationOperatorType,
} from '../model';
import { mapCreationElementFactory, mapFilterOperatorElementFactory } from './factory';

interface ObservableStruct {
	creationElement: Element | null;
	subscriberElement: Element;
	pipeElements: Element[];
}

interface ElementContext {
	elements: Map<string, Element>;
	connectLines: Map<string, string[]>;
}

const executeObservable = (observableStruct: ObservableStruct) => {
	const { creationElement, pipeElements } = observableStruct;
	if (!creationElement) {
		return;
	}

	const o = mapCreationElementFactory(creationElement) as Observable<null>;
	const pipeOperatorFuncs = pipeElements.map((el) => mapFilterOperatorElementFactory(el));

	o.pipe(
		concatMap((x) => {
			return new Promise((resolve) => {
				setTimeout(() => resolve(x), 5_000);
			});
		}),
		...(pipeOperatorFuncs as []),
	).subscribe({
		next: (val) => console.log(val),
		error: (error) => console.log(error),
		complete: () => console.log('complete'),
	});
};

const createObservableExecutable = (subscriberElement: Element, ctx: ElementContext) => {
	const observableStruct: ObservableStruct = {
		subscriberElement,
		creationElement: null,
		pipeElements: [],
	};
	let currentElement = subscriberElement;
	while (currentElement != null) {
		const [nextElementId] = ctx.connectLines.get(currentElement.id) ?? [];
		const nextElement = nextElementId ? ctx.elements.get(nextElementId) : null;
		if (!nextElement) {
			break;
		}

		if (isPipeOperatorType(nextElement.type)) {
			observableStruct.pipeElements.push(nextElement);
		} else if (isCreationOperatorType(nextElement.type)) {
			observableStruct.creationElement = nextElement;
		}

		currentElement = nextElement;
	}

	return observableStruct;
};

export const engine = (elements: Element[], cls: ConnectLine[]) => {
	const connectLineMap = cls.reduce((map, cl) => {
		if (!cl.targetId) {
			return map;
		}

		const sourceIds = map.get(cl.targetId) ?? [];
		return map.set(cl.targetId, [...sourceIds, cl.sourceId]);
	}, new Map<string, string[]>());

	const elementsMap = elements.reduce(
		(map, element) => map.set(element.id, element),
		new Map<string, Element>(),
	);

	elements
		.filter((element) => isSubscriberType(element.type))
		.map((subscriberEl) =>
			createObservableExecutable(subscriberEl, {
				elements: elementsMap,
				connectLines: connectLineMap,
			}),
		)
		.filter((os) => Boolean(os.creationElement))
		.forEach(executeObservable);
};
