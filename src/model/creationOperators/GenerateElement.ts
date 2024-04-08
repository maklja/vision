import dedent from 'dedent';
import { ElementType, Element, ElementProps } from '../element';

export interface GenerateElementProperties extends ElementProps {
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
	condition: dedent`function condition(value) { 
		return value < 3;
	}`,
	iterate: dedent`function iterate(value) { 
		return value + 1;
	}`,
	resultSelector: dedent`function resultSelector(value) {
		return value * 1000;
	}`,
};

