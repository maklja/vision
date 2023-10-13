import { CommonProps, Element, ElementType, ObservableInputsType } from '../element';

export interface CombineLatestElementProperties extends Record<string, unknown> {
	[CommonProps.ObservableInputsType]: ObservableInputsType;
}

export interface CombineLatestElement extends Element<CombineLatestElementProperties> {
	type: ElementType.CombineLatest;
}

export const combineLatestElementPropsTemplate: CombineLatestElementProperties = {
	observableInputsType: ObservableInputsType.Array,
};

