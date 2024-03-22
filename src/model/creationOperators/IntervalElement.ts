import { Element, ElementType } from '../element';

export enum IntervalElementPropertiesKeys {
	Period = 'period',
}

export interface IntervalElementProperties extends Record<string, unknown> {
	[IntervalElementPropertiesKeys.Period]: string;
	preInputObservableCreation: string;
}

export interface IntervalElement extends Element<IntervalElementProperties> {
	type: ElementType.Interval;
}

export const intervalElementPropsTemplate: IntervalElementProperties = {
	period: '1000',
	preInputObservableCreation: '() => {}',
};
