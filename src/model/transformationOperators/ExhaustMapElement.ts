import dedent from 'dedent';
import { NEXT_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface ExhaustMapElementProperties extends ElementProps {
	projectExpression: string;
}

export interface ExhaustMapElement extends Element<ExhaustMapElementProperties> {
	type: ElementType.ExhaustMap;
}

export const exhaustMapElementPropsTemplate: ExhaustMapElementProperties = {
	projectExpression: dedent`function project(value, index) { 
		return ${NEXT_GENERATOR_NAME}();
	}`,
};

