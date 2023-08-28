import { Element, ElementType } from '../element';

export interface DeferElement extends Element<never> {
	type: ElementType.Defer;
}
