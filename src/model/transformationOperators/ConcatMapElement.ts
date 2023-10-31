import { ElementType, Element } from '../element';

export interface ConcatMapElementProperties extends Record<string, unknown> {
	preInputObservableCreation: string;
}

export interface ConcatMapElement extends Element<ConcatMapElementProperties> {
	type: ElementType.ConcatMap;
}

export const concatMapElementPropsTemplate: ConcatMapElementProperties = {
	preInputObservableCreation: '(value) => {}',
};

