import { Element, ElementProps, ElementType } from '../element';

export interface ThrowErrorElementProperties extends ElementProps {
	errorOrErrorFactory: string;
}

export interface ThrowErrorElement extends Element<ThrowErrorElementProperties> {
	type: ElementType.ThrowError;
}

export const throwErrorElementPropsTemplate: ThrowErrorElementProperties = {
	errorOrErrorFactory: "() => new Error('Unexpected error!')",
};

