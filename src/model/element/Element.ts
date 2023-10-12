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
	x: number;
	y: number;
	visible: boolean;
	properties: P;
}

