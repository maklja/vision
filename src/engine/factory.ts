import { from, of } from 'rxjs';
import { Element, ElementType, OfElement, FromElement } from '../model';

const createOfCreationOperator = <T>(el: OfElement<T>) =>
	el.items ? of(...el.items) : of(el.items);

const createFromCreationOperator = <T>(el: FromElement<T>) => from(el.input);

export const creationElementsFactory = <T = unknown>(el: Element) => {
	switch (el.type) {
		case ElementType.Of:
			return createOfCreationOperator<T>(el as OfElement<T>);
		case ElementType.From:
			return createFromCreationOperator<T>(el as FromElement<T>);
	}

	return null;
};

