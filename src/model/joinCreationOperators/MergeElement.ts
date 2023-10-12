import { Element, ElementType, ObservableInputsType } from '../element';

export interface MergeElementProperties extends Record<string, unknown> {
	limitConcurrent: number;
	observableInputsType: ObservableInputsType;
}

export interface MergeElement extends Element<MergeElementProperties> {
	type: ElementType.Merge;
}

export const mergeElementPropsTemplate: MergeElementProperties = {
	limitConcurrent: 0,
	observableInputsType: ObservableInputsType.Array,
};

