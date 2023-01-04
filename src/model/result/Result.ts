import { Element, ElementType } from '../element';

export interface ResultProperties {
	hash: string;
}

export interface Result extends Element<ResultProperties> {
	type: ElementType.Result;
}
