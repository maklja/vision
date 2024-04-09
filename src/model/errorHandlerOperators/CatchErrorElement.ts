import dedent from 'dedent';
import { Element, ElementProps, ElementType } from '../element';
import { OBSERVABLE_GENERATOR_NAME } from '../common';

export interface CatchErrorElementProperties extends ElementProps {
	selectorExpression: string;
}

export interface CatchErrorElement extends Element<CatchErrorElementProperties> {
	type: ElementType.CatchError;
}

export const catchErrorElementPropsTemplate: CatchErrorElementProperties = {
	selectorExpression: dedent`function selector(err, caught) {
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

