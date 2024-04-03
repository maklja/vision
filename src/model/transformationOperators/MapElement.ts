import { ElementType, Element, ElementProps } from '../element';

export interface MapElementProperties extends ElementProps {
	expression: string;
}

export interface MapElement extends Element<MapElementProperties> {
	type: ElementType.Map;
}

export const mapElementPropsTemplate: MapElementProperties = {
	expression: '(value) => value',
};

