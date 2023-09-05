import { Element, ElementType } from '../element';

export interface FromElementProperties {
	enableObservableEvent: boolean;
	input: string;
}

export interface FromElement extends Element<FromElementProperties> {
	type: ElementType.From;
}

export const fromElementPropsTemplate: FromElementProperties = {
	enableObservableEvent: true,
	input: '() => [1, 2, 3, 4]',
};
