import { Element, ElementType } from '../element';

export interface OfElementProperties<T> extends Record<string, unknown> {
	items: T[] | null;
}

export interface OfElement<T = unknown> extends Element<OfElementProperties<T>> {
	type: ElementType.Of;
}

export const ofElementPropsTemplate: OfElementProperties<number> = {
	items: [1, 2, 3],
};

