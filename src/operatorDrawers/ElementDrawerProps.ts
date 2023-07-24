import { DrawerCommonProps, DrawerEvents } from '../drawers';

export interface ElementDrawerProps extends DrawerCommonProps, DrawerEvents {
	visibleConnectPoints?: boolean;
}
