import { NEXT_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface ConcatMapElementProperties extends ElementProps {
	projectExpression: string;
}

export interface ConcatMapElement extends Element<ConcatMapElementProperties> {
	type: ElementType.ConcatMap;
}

export const concatMapElementPropsTemplate: ConcatMapElementProperties = {
	projectExpression: `function project(value, index) { return ${NEXT_GENERATOR_NAME}(); }`,
};

