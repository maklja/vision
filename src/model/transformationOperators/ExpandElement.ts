import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface ExpandElementProperties extends ElementProps {
	concurrent?: number;
	projectExpression: string;
}

export interface ExpandElement extends Element<ExpandElementProperties> {
	type: ElementType.Expand;
}

export const expandElementPropsTemplate: ExpandElementProperties = {
	projectExpression: dedent`function project(value, index) { 
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

