import { Element, ElementType } from '../element';

export interface IntervalElementProperties {
	period: number;
}

export interface IntervalElement extends Element<IntervalElementProperties> {
	type: ElementType.Interval;
}

export const intervalElementPropsTemplate: IntervalElementProperties = {
	period: 1_000,
};
