import { ElementType } from './ElementType';

export type ElementProps = unknown | Record<string, unknown>;

export interface Element<P extends ElementProps = unknown> {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	scale: number;
	visible: boolean;
	properties: P;
}

