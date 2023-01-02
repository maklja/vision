import { Element, ElementType } from '../element';

export interface Result extends Element {
	type: ElementType.Result;
	hash: string;
}
