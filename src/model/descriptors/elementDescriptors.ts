import {
	ElementType,
	creationOperators,
	eventPipeOperators,
	isCreationOperatorType,
	isEventPipeOperatorType,
	isJoinCreationOperatorType,
	isPipeOperatorType,
	isSubscriberType,
	joinCreationOperators,
	pipeOperators,
	subscriberOperators,
} from '../element';
import { ElementDescriptor } from './ElementDescriptor';

export const joinCreationElementDescriptor: ElementDescriptor = {
	input: {
		allowedTypes: new Set<ElementType>([...joinCreationOperators, ...eventPipeOperators]),
		cardinality: 1,
	},
	output: {
		allowedTypes: new Set<ElementType>([...pipeOperators, ...subscriberOperators]),
		cardinality: 1,
	},
	event: {
		allowedTypes: new Set<ElementType>([...creationOperators, ...joinCreationOperators]),
		cardinality: Number.POSITIVE_INFINITY,
	},
};

export const creationElementDescriptor: ElementDescriptor = {
	input: {
		allowedTypes: new Set<ElementType>([...joinCreationOperators, ...eventPipeOperators]),
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
		allowedTypes: new Set<ElementType>([...joinCreationOperators, ...creationOperators]),
		cardinality: 2,
	},
};

export const deferElementDescriptor: ElementDescriptor = {
	...creationElementDescriptor,
	event: {
		allowedTypes: new Set<ElementType>([...joinCreationOperators, ...creationOperators]),
		cardinality: 1,
	},
};

export const pipeElementDescriptor: ElementDescriptor = {
	input: {
		allowedTypes: new Set<ElementType>([
			...joinCreationOperators,
			...creationOperators,
			...pipeOperators,
		]),
		cardinality: 1,
	},
	output: {
		allowedTypes: new Set<ElementType>([
			...joinCreationOperators,
			...pipeOperators,
			...subscriberOperators,
		]),
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
		allowedTypes: new Set<ElementType>([
			...joinCreationOperators,
			...creationOperators,
			...pipeOperators,
		]),
		cardinality: 1,
	},
};

const findCreationElementDescriptor = (elementType: ElementType): ElementDescriptor => {
	switch (elementType) {
		case ElementType.IIf:
			return iifElementDescriptor;
		case ElementType.Defer:
			return deferElementDescriptor;
		default:
			return creationElementDescriptor;
	}
};

export const findElementDescriptor = (elementType: ElementType): ElementDescriptor => {
	if (isJoinCreationOperatorType(elementType)) {
		return joinCreationElementDescriptor;
	}

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
