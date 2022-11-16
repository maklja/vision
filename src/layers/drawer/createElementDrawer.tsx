import {
	OfOperatorDrawer,
	FromOperatorDrawer,
	SubscriberDrawer,
	FilterOperatorDrawer,
	DrawerProps,
	IntervalOperatorDrawer,
} from '../../drawers';
import { CatchErrorOperatorDrawer } from '../../drawers/errorHandlingOperators';
import { Element, ElementType } from '../../model';

const createFromDrawer = (props: DrawerProps) => <FromOperatorDrawer {...props} />;

const createOfDrawer = (props: DrawerProps) => <OfOperatorDrawer {...props} />;

const createIntervalDrawer = (props: DrawerProps) => <IntervalOperatorDrawer {...props} />;

const createFilterOperatorDrawer = (props: DrawerProps) => <FilterOperatorDrawer {...props} />;

const createSubscriberDrawer = (props: DrawerProps) => <SubscriberDrawer {...props} />;

const createCatchErrorDrawer = (props: DrawerProps) => <CatchErrorOperatorDrawer {...props} />;

const elementFactories = new Map<ElementType, (props: DrawerProps) => JSX.Element | null>([
	[ElementType.Of, createOfDrawer],
	[ElementType.From, createFromDrawer],
	[ElementType.Interval, createIntervalDrawer],
	[ElementType.Filter, createFilterOperatorDrawer],
	[ElementType.Subscriber, createSubscriberDrawer],
	[ElementType.CatchError, createCatchErrorDrawer],
]);

export const createElementDrawer = (el: Element, props: DrawerProps): JSX.Element | null => {
	const elementFactory = elementFactories.get(el.type);
	return elementFactory?.(props) ?? null;
};

