import { Element, ElementType } from '../element';

export interface RangeElementProperties {
	start: number;
	count?: number;
}

export interface RangeElement extends Element<RangeElementProperties> {
	type: ElementType.Range;
}

export const rangeElementPropsTemplate: RangeElementProperties = {
	start: 1,
	count: 10,
};

