import dedent from 'dedent';
import { Element, ElementProps, ElementType } from '../element';

export interface ThrowErrorElementProperties extends ElementProps {
	errorOrErrorFactory: string;
}

export interface ThrowErrorElement extends Element<ThrowErrorElementProperties> {
	type: ElementType.ThrowError;
}

export const throwErrorElementPropsTemplate: ThrowErrorElementProperties = {
	errorOrErrorFactory: dedent`function errorFactory() { 
		return new Error('Unexpected error!');
	}`,
};

