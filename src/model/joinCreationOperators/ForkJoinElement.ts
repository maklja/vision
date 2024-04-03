import { CommonProps, Element, ElementProps, ElementType, ObservableInputsType } from '../element';

export interface ForkJoinElementProperties extends ElementProps {
	[CommonProps.ObservableInputsType]: ObservableInputsType;
}

export interface ForkJoinElement extends Element<ForkJoinElementProperties> {
	type: ElementType.ForkJoin;
}

export const forkJoinElementPropsTemplate: ForkJoinElementProperties = {
	observableInputsType: ObservableInputsType.Array,
};

