import { ElementType } from '../element';

export interface FilterElement extends Element {
	input: string;
	type: ElementType.Filter;
}
