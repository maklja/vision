import { ObservableInput } from 'rxjs';
import { ElementType, Element } from '../element';

export interface MergeMapElementProperties<T> {
	mapInput?: ObservableInput<T>;
}

export interface MergeMapElement<T = unknown> extends Element<MergeMapElementProperties<T>> {
	type: ElementType.MergeMap;
}

export const mergeMapElementPropsTemplate: MergeMapElementProperties<unknown> = {};
