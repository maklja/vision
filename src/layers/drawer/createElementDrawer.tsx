import {
	OfOperatorDrawer,
	FromOperatorDrawer,
	SubscriberDrawer,
	FilterOperatorDrawer,
	DrawerProps,
} from '../../drawers';
import { Element, ElementType } from '../../model';

const createFromDrawer = (props: DrawerProps) => <FromOperatorDrawer {...props} />;

const createOfDrawer = (props: DrawerProps) => <OfOperatorDrawer {...props} />;

const createFilterOperatorDrawer = (props: DrawerProps) => <FilterOperatorDrawer {...props} />;

const createSubscriberDrawer = (props: DrawerProps) => <SubscriberDrawer {...props} />;

const elementFactories = new Map<ElementType, (props: DrawerProps) => JSX.Element | null>([
	[ElementType.Of, createOfDrawer],
	[ElementType.From, createFromDrawer],
	[ElementType.Filter, createFilterOperatorDrawer],
	[ElementType.Subscriber, createSubscriberDrawer],
]);

export const createElementDrawer = (el: Element, props: DrawerProps): JSX.Element | null => {
	const elementFactory = elementFactories.get(el.type);
	return elementFactory?.(props) ?? null;
};

