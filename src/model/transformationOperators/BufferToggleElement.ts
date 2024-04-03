import { NEXT_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface BufferToggleElementProperties extends ElementProps {
	closingSelectorExpression: string;
}

export interface BufferToggleElement extends Element {
	type: ElementType.BufferToggle;
}

export const bufferToggleElementPropsTemplate: BufferToggleElementProperties = {
	closingSelectorExpression: `function project(value) { return ${NEXT_GENERATOR_NAME}(); }`,
};

