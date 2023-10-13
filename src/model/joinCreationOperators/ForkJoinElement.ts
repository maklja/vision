import { CommonProps, Element, ElementType, ObservableInputsType } from '../element';

export interface ForkJoinElementProperties extends Record<string, unknown> {
	[CommonProps.ObservableInputsType]: ObservableInputsType;
}

export interface ForkJoinElement extends Element<ForkJoinElementProperties> {
	type: ElementType.ForkJoin;
}

export const forkJoinElementPropsTemplate: ForkJoinElementProperties = {
	observableInputsType: ObservableInputsType.Array,
};

