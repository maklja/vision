import dedent from 'dedent';
import { Element, ElementProps, ElementType } from '../element';

export interface OfElementProperties extends ElementProps {
	argsFactoryExpression: string;
}

export interface OfElement extends Element<OfElementProperties> {
	type: ElementType.Of;
}

export const ofElementPropsTemplate: OfElementProperties = {
	argsFactoryExpression: dedent`function argsFactory() {
		return [1, 2, 3, 4];
	}`,
};

