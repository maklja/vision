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

export const findElementDescriptor = (elementType: ElementType): ElementDescriptor => {
	if (isCreationOperatorType(elementType)) {
		return creationElementDescriptor;
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

