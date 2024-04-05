import { MISSING_OBSERVABLE_COMMENT } from '../common';
import { ElementType, Element, ElementProps } from '../element';

export interface BufferToggleElementProperties extends ElementProps {
	closingSelectorExpression: string;
}

export interface BufferToggleElement extends Element {
	type: ElementType.BufferToggle;
}

export const bufferToggleElementPropsTemplate: BufferToggleElementProperties = {
	closingSelectorExpression: MISSING_OBSERVABLE_COMMENT,
};

