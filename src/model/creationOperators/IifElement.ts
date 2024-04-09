import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
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
	conditionExpression: dedent`function condition() {
		return true;
	}`,
	trueCallbackExpression: dedent`function trueResult() {
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
	falseCallbackExpression: dedent`function falseResult() {
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

