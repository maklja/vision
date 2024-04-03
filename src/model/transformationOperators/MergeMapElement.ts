import { NEXT_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface MergeMapElementProperties extends ElementProps {
	concurrent?: number;
	projectExpression: string;
}

export interface MergeMapElement extends Element<MergeMapElementProperties> {
	type: ElementType.MergeMap;
}

export const mergeMapElementPropsTemplate: MergeMapElementProperties = {
	projectExpression: `function project(value, index) { return ${NEXT_GENERATOR_NAME}(); }`,
};

