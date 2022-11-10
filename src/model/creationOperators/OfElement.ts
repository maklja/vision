import { Element, ElementType } from '../element';

export interface OfElement<T = unknown> extends Element {
	items: T[] | null;
	type: ElementType.Of;
}
