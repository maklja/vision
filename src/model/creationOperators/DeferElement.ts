import dedent from 'dedent';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { Element, ElementProps, ElementType } from '../element';

export interface DeferElementProperties extends ElementProps {
	observableFactory: string;
}

export interface DeferElement extends Element<DeferElementProperties> {
	type: ElementType.Defer;
}

export const deferElementPropsTemplate: DeferElementProperties = {
	observableFactory: dedent`function input() {
		return ${OBSERVABLE_GENERATOR_NAME}();
	}`,
};

