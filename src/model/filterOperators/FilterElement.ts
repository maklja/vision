import { ElementType, Element } from '../element';

export interface FilterElementProperties extends Record<string, unknown> {
	expression: string;
}

export interface FilterElement extends Element<FilterElementProperties> {
	type: ElementType.Filter;
}

export const filterElementPropsTemplate: FilterElementProperties = {
	expression: '() => true',
};

