import { ElementType, Element } from '../element';

export interface GenerateElementProperties {
	initialState: string;
	condition?: string;
	iterate: string;
	resultSelector: string;
}

export interface GenerateElement extends Element<GenerateElementProperties> {
	type: ElementType.Generate;
}

export const generateElementPropsTemplate: GenerateElementProperties = {
	initialState: '0',
	condition: '(value) => value < 3',
	iterate: '(value) => value + 1',
	resultSelector: '(value) => value * 1000',
};

