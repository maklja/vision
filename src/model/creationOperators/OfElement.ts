import { Element, ElementType } from '../element';

export interface OfElementProperties extends Record<string, unknown> {
	itemsFactory: string;
}

export interface OfElement extends Element<OfElementProperties> {
	type: ElementType.Of;
}

export const ofElementPropsTemplate: OfElementProperties = {
	itemsFactory: '() => []',
};

