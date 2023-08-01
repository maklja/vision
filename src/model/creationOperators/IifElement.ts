import { ObservableInput } from 'rxjs';
import { Element, ElementType } from '../element';

export interface IifElementProperties<T> {
	conditionExpression: string;
	trueResult?: ObservableInput<T>;
	falseResult?: ObservableInput<T>;
}

export interface IifElement<T = unknown> extends Element<IifElementProperties<T>> {
	type: ElementType.IIf;
}

export const iifElementPropsTemplate: IifElementProperties<unknown> = {
	conditionExpression: '() => true',
};

