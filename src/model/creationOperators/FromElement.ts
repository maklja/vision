import { Element, ElementType, CommonProps } from '../element';

export interface FromElementProperties extends Record<string, unknown> {
	[CommonProps.EnableObservableEvent]: boolean;
	input: string;
}

export interface FromElement extends Element<FromElementProperties> {
	type: ElementType.From;
}

export const fromElementPropsTemplate: FromElementProperties = {
	enableObservableEvent: true,
	input: '() => [1, 2, 3, 4]',
};

