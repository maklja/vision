import {
	ElementType,
	creationOperators,
	eventPipeOperators,
	isCreationOperatorType,
	isEventPipeOperatorType,
	isPipeOperatorType,
	isSubscriberType,
	pipeOperators,
	subscriberOperators,
} from '../element';
import { ElementDescriptor } from './ElementDescriptor';

export const creationElementDescriptor: ElementDescriptor = {
	input: {
		allowedTypes: new Set<ElementType>([...eventPipeOperators]),
		cardinality: 1,
	},
	output: {
		allowedTypes: new Set<ElementType>([...pipeOperators, ...subscriberOperators]),
		cardinality: 1,
	},
};

export const iifElementDescriptor: ElementDescriptor = {
	...creationElementDescriptor,
	event: {
		allowedTypes: new Set<ElementType>([...creationOperators]),
		cardinality: 2,
	},
};

export const pipeElementDescriptor: ElementDescriptor = {
	input: {
		allowedTypes: new Set<ElementType>([...creationOperators, ...pipeOperators]),
		cardinality: 1,
	},
	output: {
		allowedTypes: new Set<ElementType>([...pipeOperators, ...subscriberOperators]),
		cardinality: 1,
	},
};

export const eventPipeElementDescriptor: ElementDescriptor = {
	...pipeElementDescriptor,
	event: {
		allowedTypes: new Set<ElementType>([...creationOperators]),
		cardinality: 1,
	},
};

export const subscriberElementDescriptor: ElementDescriptor = {
	input: {
		allowedTypes: new Set<ElementType>([...creationOperators, ...pipeOperators]),
		cardinality: 1,
	},
};

const findCreationElementDescriptor = (elementType: ElementType): ElementDescriptor => {
	switch (elementType) {
		case ElementType.IIf:
			return iifElementDescriptor;
		default:
			return creationElementDescriptor;
	}
};

export const findElementDescriptor = (elementType: ElementType): ElementDescriptor => {
	if (isCreationOperatorType(elementType)) {
		return findCreationElementDescriptor(elementType);
	}

	if (isSubscriberType(elementType)) {
		return subscriberElementDescriptor;
	}

	if (isEventPipeOperatorType(elementType)) {
		return eventPipeElementDescriptor;
	}

	if (isPipeOperatorType(elementType)) {
		return pipeElementDescriptor;
	}

	return {};
};

export const calcConnectPointVisibility = (elType: ElementType) => {
	const { input, event, output } = findElementDescriptor(elType);

	const inputVisible = Boolean(input?.cardinality);
	const outputVisible = Boolean(output?.cardinality);
	const eventsVisible = Boolean(event?.cardinality);
	return {
		inputVisible,
		outputVisible,
		eventsVisible,
	};
};

