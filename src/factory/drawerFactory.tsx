import { elementConnector } from '../store/connector';
import { OfOperatorDrawer, FromOperatorDrawer, ConnectedSubscriberElement } from '../drawers';
import { Element, ElementType } from '../model';

const ConnectedOfOperatorDrawer = elementConnector(OfOperatorDrawer);
const ConnectedFromOperatorDrawer = elementConnector(FromOperatorDrawer);

const createOfElement = (el: Element) => <ConnectedOfOperatorDrawer id={el.id} key={el.id} />;

const createFromElement = (el: Element) => <ConnectedFromOperatorDrawer id={el.id} key={el.id} />;

const createSubscriberElement = (el: Element) => (
	<ConnectedSubscriberElement id={el.id} key={el.id} />
);

const elementFactories = new Map<ElementType, (el: Element) => JSX.Element>([
	[ElementType.Of, createOfElement],
	[ElementType.From, createFromElement],
	[ElementType.Subscriber, createSubscriberElement],
]);

export const createDrawerElement = (el: Element) => {
	const elementFactory = elementFactories.get(el.type);
	return elementFactory ? elementFactory(el) : null;
};

