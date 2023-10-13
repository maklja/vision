import { Element, ElementType } from '../element';

export interface IifElementProperties extends Record<string, unknown> {
	conditionExpression: string;
}

export interface IifElement extends Element<IifElementProperties> {
	type: ElementType.IIf;
}

export const iifElementPropsTemplate: IifElementProperties = {
	conditionExpression: '() => true',
};

