import { ElementType, Element } from '../element';

export interface FilterElementProperties {
	expression: string;
}

export interface FilterElement extends Element<FilterElementProperties> {
	type: ElementType.Filter;
}
