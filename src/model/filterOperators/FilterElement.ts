import { ElementType, Element, ElementProps } from '../element';

export interface FilterElementProperties extends ElementProps {
	predicateExpression: string;
}

export interface FilterElement extends Element<FilterElementProperties> {
	type: ElementType.Filter;
}

export const filterElementPropsTemplate: FilterElementProperties = {
	predicateExpression: 'function predicate() { return true; }',
};

