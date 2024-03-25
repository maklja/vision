import { ElementType, Element } from '../element';

export interface ExpandElementProperties extends Record<string, unknown> {
	concurrent?: number;
}

export interface ExpandElement extends Element<ExpandElementProperties> {
	type: ElementType.Expand;
}

export const expandElementPropsTemplate: ExpandElementProperties = {};

