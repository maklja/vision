import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface ExhaustMapElementProperties extends ElementProps {
	projectExpression: string;
}

export interface ExhaustMapElement extends Element<ExhaustMapElementProperties> {
	type: ElementType.ExhaustMap;
}

export const exhaustMapElementPropsTemplate: ExhaustMapElementProperties = {
	projectExpression: dedent`function project(value, index) { 
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

