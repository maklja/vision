import { ElementType, Element } from '../element';

export interface MapElementProperties {
	expression: string;
}

export interface MapElement extends Element<MapElementProperties> {
	type: ElementType.Map;
}

export const mapElementPropsTemplate: MapElementProperties = {
	expression: '(value) => value',
};

