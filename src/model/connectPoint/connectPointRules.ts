import {
	ElementType,
	isCreationOperatorType,
	isPipeOperatorType,
	pipeOperators,
	subscriberOperators,
} from '..';

export const calculateConnectPointTypes = (sourceType: ElementType) => {
	if (isCreationOperatorType(sourceType) || isPipeOperatorType(sourceType)) {
		return new Set<string>([...pipeOperators, ...subscriberOperators]);
	}

	return new Set<string>();
};