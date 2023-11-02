import { Element, ElementType } from '../element';

export interface DeferElementProperties extends Record<string, unknown> {
	preInputObservableCreation: string;
}

export interface DeferElement extends Element<DeferElementProperties> {
	type: ElementType.Defer;
}

export const deferElementPropsTemplate: DeferElementProperties = {
	preInputObservableCreation: '() => {}',
};

