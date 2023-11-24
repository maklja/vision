import { Element, ElementType } from '../element';

export interface IifElementProperties extends Record<string, unknown> {
	conditionExpression: string;
	truthyInputObservableCreation: string;
	falsyInputObservableCreation: string;
}

export interface IifElement extends Element<IifElementProperties> {
	type: ElementType.IIf;
}

export const iifElementPropsTemplate: IifElementProperties = {
	conditionExpression: '() => true',
	truthyInputObservableCreation: '() => {}',
	falsyInputObservableCreation: '() => {}',
};
