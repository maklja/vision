import { Element, ElementProps, ElementType } from '../element';

export interface OfElementProperties extends ElementProps {
	items: string | unknown[] | null;
}

export interface OfElement extends Element<OfElementProperties> {
	type: ElementType.Of;
}

export const ofElementPropsTemplate: OfElementProperties = {
	items: [1, 2, 3],
};

