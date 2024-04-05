import { MISSING_OBSERVABLE_COMMENT } from '../common';
import { Element, ElementProps, ElementType } from '../element';

export interface DeferElementProperties extends ElementProps {
	observableFactory: string;
}

export interface DeferElement extends Element<DeferElementProperties> {
	type: ElementType.Defer;
}

export const deferElementPropsTemplate: DeferElementProperties = {
	observableFactory: MISSING_OBSERVABLE_COMMENT,
};

