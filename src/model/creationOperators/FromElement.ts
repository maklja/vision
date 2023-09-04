import { Element, ElementType } from '../element';

export interface FromElementProperties {
	input: string;
}

export interface FromElement extends Element<FromElementProperties> {
	type: ElementType.From;
}

export const fromElementPropsTemplate: FromElementProperties = {
	input: '[1, 2, 3, 4]',
};
