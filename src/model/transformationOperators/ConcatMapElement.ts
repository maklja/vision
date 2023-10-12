import { ObservableInput } from 'rxjs';
import { ElementType, Element } from '../element';

export interface ConcatMapElementProperties<T> extends Record<string, unknown> {
	mapInput?: ObservableInput<T>;
}

export interface ConcatMapElement<T = unknown> extends Element<ConcatMapElementProperties<T>> {
	type: ElementType.ConcatMap;
}

export const concatMapElementPropsTemplate: ConcatMapElementProperties<unknown> = {};

