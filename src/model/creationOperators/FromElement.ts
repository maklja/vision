import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { Element, ElementType, CommonProps, ElementProps } from '../element';

export interface FromElementProperties extends ElementProps {
	[CommonProps.EnableObservableEvent]: boolean;
	inputCallbackExpression: string;
	observableFactory: string;
}

export interface FromElement extends Element<FromElementProperties> {
	type: ElementType.From;
}

export const fromElementPropsTemplate: FromElementProperties = {
	enableObservableEvent: true,
	inputCallbackExpression: dedent`function input() {
		return [1, 2, 3, 4];
	}`,
	observableFactory: dedent`function input() {
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

