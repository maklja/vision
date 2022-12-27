import {
	OfOperatorDrawer,
	FromOperatorDrawer,
	SubscriberDrawer,
	FilterOperatorDrawer,
	DrawerProps,
	IntervalOperatorDrawer,
} from '../../drawers';
import { CatchErrorOperatorDrawer } from '../../drawers/errorHandlingOperators';
import { ElementType } from '../../model';

const createFromDrawer = (props: DrawerProps) => <FromOperatorDrawer {...props} />;

const createOfDrawer = (props: DrawerProps) => <OfOperatorDrawer {...props} />;

const createIntervalDrawer = (props: DrawerProps) => <IntervalOperatorDrawer {...props} />;

const createFilterOperatorDrawer = (props: DrawerProps) => <FilterOperatorDrawer {...props} />;

const createSubscriberDrawer = (props: DrawerProps) => <SubscriberDrawer {...props} />;

const createCatchErrorDrawer = (props: DrawerProps) => <CatchErrorOperatorDrawer {...props} />;

const elementFactories = new Map<ElementType, (props: DrawerProps) => JSX.Element>([
	[ElementType.Of, createOfDrawer],
	[ElementType.From, createFromDrawer],
	[ElementType.Interval, createIntervalDrawer],
	[ElementType.Filter, createFilterOperatorDrawer],
	[ElementType.Subscriber, createSubscriberDrawer],
	[ElementType.CatchError, createCatchErrorDrawer],
]);

export type ElementDrawerFactory = ((props: DrawerProps) => JSX.Element) | null;

export const findElementDrawer = (elementType: ElementType): ElementDrawerFactory => {
	return elementFactories.get(elementType) ?? null;
};
