export enum ElementType {
	Of = 'of',
	From = 'from',
	Filter = 'filter',
	Subscriber = 'subscriber',
}

export const creationOperators = [ElementType.Of, ElementType.From];

export const filterOperators = [ElementType.Filter];

export const pipeOperators = [...filterOperators];
