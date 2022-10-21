import { ObservableInput } from 'rxjs';
import { Element } from '../Element';
import { ElementType } from '../ElementType';

export interface FromElement<T = unknown> extends Element {
	input: ObservableInput<T>;
	type: ElementType.From;
}

