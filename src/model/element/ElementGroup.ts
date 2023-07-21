import {
	ElementType,
	creationOperators,
	filteringOperators,
	errorHandlerOperators,
	joinCreationOperators,
	pipeOperators,
	subscriberOperators,
	resultOperators,
} from './ElementType';

export enum ElementGroup {
	Creation = 'creation',
	JoinCreation = 'joinCreation',
	Transformation = 'transformation',
	Filtering = 'filtering',
	Join = 'join',
	Multicasting = 'multicasting',
	ErrorHandling = 'errorHandling',
	Utility = 'utility',
	Conditional = 'conditional',
	Mathematical = 'mathematical',
	Subscriber = 'subscriber',
	Result = 'result',
}

export const mapElementGroupToTypes = (elGroup: ElementGroup): ReadonlySet<ElementType> => {
	switch (elGroup) {
		case ElementGroup.Creation:
			return creationOperators;
		case ElementGroup.JoinCreation:
			return joinCreationOperators;
		case ElementGroup.Filtering:
			return pipeOperators;
		case ElementGroup.ErrorHandling:
			return errorHandlerOperators;
		case ElementGroup.Subscriber:
			return subscriberOperators;
		case ElementGroup.Result:
			return resultOperators;
		default:
			return new Set();
	}
};

export const mapElementTypeToGroup = (elType: ElementType): ElementGroup => {
	if (creationOperators.has(elType)) {
		return ElementGroup.Creation;
	}

	if (joinCreationOperators.has(elType)) {
		return ElementGroup.JoinCreation;
	}

	if (errorHandlerOperators.has(elType)) {
		return ElementGroup.ErrorHandling;
	}

	if (filteringOperators.has(elType)) {
		return ElementGroup.Filtering;
	}

	if (subscriberOperators.has(elType)) {
		return ElementGroup.Subscriber;
	}

	if (resultOperators.has(elType)) {
		return ElementGroup.Result;
	}

	throw new Error(`Unknown element group for element type ${elType}`);
};

