import { ConnectedOfElement, ConnectedSubscriberElement } from '../elements';
import { Drawer, DrawerType } from '../model';

const createOfElement = (drawer: Drawer) => <ConnectedOfElement id={drawer.id} key={drawer.id} />;

const createSubscriberElement = (drawer: Drawer) => (
	<ConnectedSubscriberElement id={drawer.id} key={drawer.id} />
);

const elementFactories = new Map<DrawerType, (drawer: Drawer) => JSX.Element>([
	[DrawerType.CreationOperator, createOfElement],
	[DrawerType.Subscriber, createSubscriberElement],
]);

export const createDrawerElement = (drawer: Drawer) => {
	const elementFactory = elementFactories.get(drawer.type);
	return elementFactory ? elementFactory(drawer) : null;
};

