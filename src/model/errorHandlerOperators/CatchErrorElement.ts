import dedent from 'dedent';
import { Element, ElementProps, ElementType } from '../element';
import { NEXT_GENERATOR_NAME } from '../common';

export interface CatchErrorElementProperties extends ElementProps {
	selectorExpression: string;
}

export interface CatchErrorElement extends Element<CatchErrorElementProperties> {
	type: ElementType.CatchError;
}

export const catchErrorElementPropsTemplate: CatchErrorElementProperties = {
	selectorExpression: dedent`function selector(err, caught) { 
		return ${NEXT_GENERATOR_NAME}();
	}`,
};

