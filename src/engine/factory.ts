import { filter, from, of } from 'rxjs';
import { Element, ElementType, OfElement, FromElement, FilterElement } from '../model';

const createOfCreationOperator = <T>(el: OfElement<T>) =>
	el.items ? of(...el.items) : of(el.items);

const createFromCreationOperator = <T>(el: FromElement<T>) => from(el.input);

const createFilterOperator = <T>(el: FilterElement) => {
	const filterFn = new Function(`return ${el.expression}`);

	return filter<T>(filterFn());
};

export const mapCreationElementFactory = <T = unknown>(el: Element) => {
	switch (el.type) {
		case ElementType.Of:
			return createOfCreationOperator<T>(el as OfElement<T>);
		case ElementType.From:
			return createFromCreationOperator<T>(el as FromElement<T>);
	}

	// TODO
	throw new Error(`Unknown creation operator element with type ${el.type}`);
};

export const mapFilterOperatorElementFactory = <T = unknown>(el: Element) => {
	switch (el.type) {
		case ElementType.Filter:
			return createFilterOperator<T>(el as FilterElement);
	}

	// TODO
	throw new Error(`Unknown pipe operator element with type ${el.type}`);
};
