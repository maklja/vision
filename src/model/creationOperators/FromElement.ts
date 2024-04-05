import { MISSING_OBSERVABLE_COMMENT } from '../common';
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
	inputCallbackExpression: '',
	observableFactory: MISSING_OBSERVABLE_COMMENT,
};

