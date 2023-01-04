import { ObservableInput } from 'rxjs';
import { Element, ElementType } from '../element';

export interface FromElementProperties<T> {
	input: ObservableInput<T>;
}

export interface FromElement<T = unknown> extends Element<FromElementProperties<T>> {
	type: ElementType.From;
}
