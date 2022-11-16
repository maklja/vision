import { Element, ElementType } from '../element';

export interface IntervalElement extends Element {
	period: number;
	type: ElementType.Interval;
}

