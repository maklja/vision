import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface BufferToggleElementProperties extends ElementProps {
	closingSelectorExpression: string;
}

export interface BufferToggleElement extends Element<BufferToggleElementProperties> {
	type: ElementType.BufferToggle;
}

export const bufferToggleElementPropsTemplate: BufferToggleElementProperties = {
	closingSelectorExpression: dedent`function project(value) { 
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

