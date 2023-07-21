import { Element, ElementType } from '../element';

export interface ResultProperties {
	hash: string;
}

export interface ResultElement extends Element<ResultProperties> {
	type: ElementType.Result;
}

