import { DrawerType } from './DrawerType';

export interface Drawer {
	id: string;
	type: DrawerType;
	x: number;
	y: number;
	size: number;
}

