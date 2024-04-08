import dedent from 'dedent';
import { NEXT_GENERATOR_NAME } from '../common';
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
		return ${NEXT_GENERATOR_NAME}();
	}`,
};

