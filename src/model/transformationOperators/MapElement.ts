import dedent from 'dedent';
import { ElementType, Element, ElementProps } from '../element';

export interface MapElementProperties extends ElementProps {
	projectExpression: string;
}

export interface MapElement extends Element<MapElementProperties> {
	type: ElementType.Map;
}

export const mapElementPropsTemplate: MapElementProperties = {
	projectExpression: dedent`function project(value, index) { 
		return value;
	}`,
};

