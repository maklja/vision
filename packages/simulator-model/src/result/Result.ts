import { Element, ElementProps, ElementType } from '../element';

export interface ResultProperties extends ElementProps {
	hash: string;
}

export interface ResultElement extends Element<ResultProperties> {
	type: ElementType.Result;
}

