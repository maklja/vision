import { ElementType } from './ElementType';

export enum CommonProps {
	EnableObservableEvent = 'enableObservableEvent',
}

export type ElementProps = object;

export interface Element<P extends ElementProps = object> {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	visible: boolean;
	properties: P;
}

