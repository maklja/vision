import { Element, ElementType } from '../element';

export interface RangeElementProperties extends Record<string, unknown> {
	start: string;
	count?: string;
	preInputObservableCreation: string;
}

export interface RangeElement extends Element<RangeElementProperties> {
	type: ElementType.Range;
}

export const rangeElementPropsTemplate: RangeElementProperties = {
	start: '1',
	count: '10',
	preInputObservableCreation: '() => {}',
};
