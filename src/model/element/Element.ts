import { ElementType } from './ElementType';

export type ElementProps = object;

export interface Element<P extends ElementProps = object> {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	scale: number;
	visible: boolean;
	properties: P;
}
