import { ObservableInput } from 'rxjs';
import { Element, ElementType } from '../element';

export interface FromElement<T = unknown> extends Element {
	input: ObservableInput<T>;
	type: ElementType.From;
}
