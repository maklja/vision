import {
	ElementType,
	creationOperators,
	errorHandlerOperators,
	joinCreationOperators,
	pipeOperators,
	subscriberOperators,
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
		default:
			return new Set();
	}
};
