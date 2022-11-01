import { ConnectLine, Element, isSubscriberType } from '../model';
import { createObservableExecutable } from './createObservableExecutable';
import { ObservableSimulation } from './ObservableSimulation';

export const createObservableSimulation = <T = unknown>(
	elements: Element[],
	cls: ConnectLine[],
) => {
	const connectLineMap = cls.reduce((map, cl) => {
		if (!cl.targetId) {
			return map;
		}

		const cls = map.get(cl.targetId) ?? [];
		return map.set(cl.targetId, [...cls, cl]);
	}, new Map<string, ConnectLine[]>());

	const elementsMap = elements.reduce(
		(map, element) => map.set(element.id, element),
		new Map<string, Element>(),
	);

	return elements
		.filter((element) => isSubscriberType(element.type))
		.map((subscriberEl) =>
			createObservableExecutable(subscriberEl, {
				elements: elementsMap,
				connectLines: connectLineMap,
			}),
		)
		.map((os) => {
			const { creationElement, pipeElements, connectLines, subscriberElement } = os;
			if (!creationElement) {
				return null;
			}
			return new ObservableSimulation<T>({
				creationElement,
				pipeElements,
				connectLines,
				subscriberElement,
			});
		})
		.filter((os): os is ObservableSimulation<T> => Boolean(os));
};

