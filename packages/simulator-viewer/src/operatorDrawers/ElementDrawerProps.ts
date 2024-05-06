import { ElementProps } from '@maklja/vision-simulator-model';
import { DrawerCommonProps, DrawerEvents } from '../drawers';

export interface ElementDrawerProps extends DrawerCommonProps, DrawerEvents {
	scale?: number;
	visibleConnectPoints?: boolean;
	properties: ElementProps;
}
