import { Element, ElementProps, ElementType } from '../element';

export interface RangeElementProperties extends ElementProps {
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

