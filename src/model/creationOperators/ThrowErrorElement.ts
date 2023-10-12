import { Element, ElementType } from '../element';

export interface ThrowErrorElementProperties extends Record<string, unknown> {
	errorOrErrorFactory: string;
}

export interface ThrowErrorElement extends Element<ThrowErrorElementProperties> {
	type: ElementType.ThrowError;
}

export const throwErrorElementPropsTemplate: ThrowErrorElementProperties = {
	errorOrErrorFactory: "() => new Error('Unexpected error!')",
};

