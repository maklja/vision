import { DrawerCommonProps, DrawerEvents } from '../drawers';
import { ElementProps } from '../model';

export interface ElementDrawerProps extends DrawerCommonProps, DrawerEvents {
	scale?: number;
	visibleConnectPoints?: boolean;
	properties: ElementProps;
}
