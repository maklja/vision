import { Element } from '../element/Element';
import { ElementType } from '../ElementType';

export interface OfElement<T = unknown> extends Element {
	items: T[] | null;
	type: ElementType.Of;
}

