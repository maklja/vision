import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface BufferWhenElementProperties extends ElementProps {
	closingSelectorExpression: string;
}

export interface BufferWhenElement extends Element<BufferWhenElementProperties> {
	type: ElementType.BufferWhen;
}

export const bufferWhenElementPropsTemplate: BufferWhenElementProperties = {
	closingSelectorExpression: dedent`function closingSelector() { 
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

