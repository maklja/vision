import { ElementType } from './ElementType';

export enum CommonProps {
	EnableObservableEvent = 'enableObservableEvent',
	ObservableInputsType = 'observableInputsType',
}

export enum ObservableInputsType {
	Array = 'array',
	Object = 'object',
}

export type ElementProps = Record<string, unknown>;

export interface Element<P extends ElementProps = Record<string, unknown>> {
	id: string;
	type: ElementType;
	name: string;
	x: number;
	y: number;
	visible: boolean;
	properties: P;
}

export const EMPTY_ELEMENT: Element = {
	id: '',
	name: '',
	type: ElementType.Empty,
	visible: false,
	x: 0,
	y: 0,
	properties: {},
};

