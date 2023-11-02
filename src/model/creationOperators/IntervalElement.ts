import { Element, ElementType } from '../element';

export interface IntervalElementProperties extends Record<string, unknown> {
	period: string;
}

export interface IntervalElement extends Element<IntervalElementProperties> {
	type: ElementType.Interval;
}

export const intervalElementPropsTemplate: IntervalElementProperties = {
	period: '1000',
};

