import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface BufferWhenElementProperties extends ElementProps {
	closingSelectorExpression: string;
}

export interface BufferWhenElement extends Element {
	type: ElementType.BufferWhen;
}

export const bufferWhenElementPropsTemplate: BufferWhenElementProperties = {
	closingSelectorExpression: dedent`function project(value, index) { 
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

