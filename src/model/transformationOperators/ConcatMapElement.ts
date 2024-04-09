import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface ConcatMapElementProperties extends ElementProps {
	projectExpression: string;
}

export interface ConcatMapElement extends Element<ConcatMapElementProperties> {
	type: ElementType.ConcatMap;
}

export const concatMapElementPropsTemplate: ConcatMapElementProperties = {
	projectExpression: dedent`function project(value, index) { 
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

