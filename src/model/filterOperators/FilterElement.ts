import { ElementType, Element } from '../element';

export interface FilterElement extends Element {
	expression: string;
	type: ElementType.Filter;
}
