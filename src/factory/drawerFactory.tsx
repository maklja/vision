import { OfDrawer, SubscriberDrawer } from '../drawers';
import { Drawer, DrawerType } from '../model';

const createOfElement = (drawer: Drawer) => (
	<OfDrawer id={drawer.id} x={drawer.x} y={drawer.y} size={1} key={drawer.id} />
);

const createSubscriberElement = (drawer: Drawer) => (
	<SubscriberDrawer id={drawer.id} x={drawer.x} y={drawer.y} size={1} key={drawer.id} />
);

const drawerElementFactories = new Map<DrawerType, (drawer: Drawer) => JSX.Element>([
	[DrawerType.Of, createOfElement],
	[DrawerType.Subscriber, createSubscriberElement],
]);

export const createDrawerElement = (drawer: Drawer) => {
	const drawerElementFactory = drawerElementFactories.get(drawer.type);

	return drawerElementFactory ? drawerElementFactory(drawer) : null;
};
