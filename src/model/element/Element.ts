import { ElementType } from './ElementType';

export interface Element<P extends unknown | Record<string, unknown> = unknown> {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	size: number;
	visible: boolean;
	properties: P;
}
