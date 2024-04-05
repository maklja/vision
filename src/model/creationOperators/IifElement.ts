import { MISSING_OBSERVABLE_COMMENT } from '../common';
import { Element, ElementProps, ElementType } from '../element';

export interface IifElementProperties extends ElementProps {
	conditionExpression: string;
	trueCallbackExpression: string;
	falseCallbackExpression: string;
}

export interface IifElement extends Element<IifElementProperties> {
	type: ElementType.IIf;
}

export const iifElementPropsTemplate: IifElementProperties = {
	conditionExpression: 'function condition() { return true; }',
	trueCallbackExpression: MISSING_OBSERVABLE_COMMENT,
	falseCallbackExpression: MISSING_OBSERVABLE_COMMENT,
};

