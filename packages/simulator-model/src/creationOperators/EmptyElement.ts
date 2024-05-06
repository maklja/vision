import { Element, ElementType } from '../element';

export interface EmptyElement extends Element<never> {
	type: ElementType.Empty;
}
