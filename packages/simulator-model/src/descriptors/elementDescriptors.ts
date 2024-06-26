import { FromElementProperties } from '../creationOperators';
import {
	ElementProps,
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
		allowedTypes: new Set<ElementType>([
			...pipeOperators,
			...eventPipeOperators,
			...subscriberOperators,
		]),
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
		allowedTypes: new Set<ElementType>([
			...pipeOperators,
			...eventPipeOperators,
			...subscriberOperators,
		]),
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

export const fromElementDescriptor: ElementDescriptor = {
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
		allowedTypes: new Set<ElementType>([...pipeOperators, ...subscriberOperators]),
		cardinality: 1,
	},
};

export const eventPipeElementDescriptor: ElementDescriptor = {
	...pipeElementDescriptor,
	event: {
		allowedTypes: new Set<ElementType>([...creationOperators, ...joinCreationOperators]),
		cardinality: 1,
	},
};

export const bufferToggleElementDescriptor: ElementDescriptor = {
	...eventPipeElementDescriptor,
	event: {
		allowedTypes: new Set<ElementType>([...joinCreationOperators, ...creationOperators]),
		cardinality: 2,
	},
};

export const subscriberElementDescriptor: ElementDescriptor = {
	input: {
		allowedTypes: new Set<ElementType>([
			...joinCreationOperators,
			...creationOperators,
			...pipeOperators,
			...eventPipeOperators,
		]),
		cardinality: 1,
	},
};

function findCreationElementDescriptor(
	elementType: ElementType,
	elementProps: ElementProps,
): ElementDescriptor {
	if (elementType === ElementType.IIf) {
		return iifElementDescriptor;
	}

	if (elementType === ElementType.Defer) {
		return deferElementDescriptor;
	}

	if (elementType === ElementType.From) {
		const fromProperties = elementProps as FromElementProperties;
		return fromProperties.enableObservableEvent
			? fromElementDescriptor
			: creationElementDescriptor;
	}

	return creationElementDescriptor;
}

function findEventPipeElementDescriptor(elementType: ElementType) {
	if (elementType === ElementType.BufferToggle) {
		return bufferToggleElementDescriptor;
	}

	return eventPipeElementDescriptor;
}

export function findElementDescriptor(
	elementType: ElementType,
	elementProps: ElementProps,
): ElementDescriptor {
	if (isJoinCreationOperatorType(elementType)) {
		return joinCreationElementDescriptor;
	}

	if (isCreationOperatorType(elementType)) {
		return findCreationElementDescriptor(elementType, elementProps);
	}

	if (isSubscriberType(elementType)) {
		return subscriberElementDescriptor;
	}

	if (isEventPipeOperatorType(elementType)) {
		return findEventPipeElementDescriptor(elementType);
	}

	if (isPipeOperatorType(elementType)) {
		return pipeElementDescriptor;
	}

	return {};
}

export function calcConnectPointVisibility(elType: ElementType, elementProps: ElementProps) {
	const { input, event, output } = findElementDescriptor(elType, elementProps);

	const inputVisible = Boolean(input?.cardinality);
	const outputVisible = Boolean(output?.cardinality);
	const eventsVisible = Boolean(event?.cardinality);
	return {
		inputVisible,
		outputVisible,
		eventsVisible,
	};
}

