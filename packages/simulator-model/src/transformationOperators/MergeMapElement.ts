import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface MergeMapElementProperties extends ElementProps {
	concurrent?: number;
	projectExpression: string;
}

export interface MergeMapElement extends Element<MergeMapElementProperties> {
	type: ElementType.MergeMap;
}

export const mergeMapElementPropsTemplate: MergeMapElementProperties = {
	projectExpression: dedent`function project(value, index) { 
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

