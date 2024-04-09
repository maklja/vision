import { CommonProps, Element, ElementProps, ElementType, ObservableInputsType } from '../element';

export interface CombineLatestElementProperties extends ElementProps {
	[CommonProps.ObservableInputsType]: ObservableInputsType;
}

export interface CombineLatestElement extends Element<CombineLatestElementProperties> {
	type: ElementType.CombineLatest;
}

export const combineLatestElementPropsTemplate: CombineLatestElementProperties = {
	observableInputsType: ObservableInputsType.Array,
};

