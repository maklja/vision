import { ElementType } from './ElementType';

export interface Element {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	size: number;
	visible: boolean;
}

