import { NumericParameter } from '../parameters/ParameterValue';
import { Element, ElementProps, ElementType } from '../element';

export interface IntervalElementProperties extends ElementProps {
	period: NumericParameter;
}

export interface IntervalElement extends Element<IntervalElementProperties> {
	type: ElementType.Interval;
}

export const intervalElementPropsTemplate: IntervalElementProperties = {
	period: 1_000,
};
