import { Element, ElementType } from '../element';

export interface ResultProperties extends Record<string, unknown> {
	hash: string;
}

export interface ResultElement extends Element<ResultProperties> {
	type: ElementType.Result;
}

