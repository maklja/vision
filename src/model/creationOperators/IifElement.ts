import { NEXT_GENERATOR_NAME } from '../common';
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
	trueCallbackExpression: `function trueResult() { return ${NEXT_GENERATOR_NAME}(); }`,
	falseCallbackExpression: `function falseResult() { return ${NEXT_GENERATOR_NAME}(); }`,
};

