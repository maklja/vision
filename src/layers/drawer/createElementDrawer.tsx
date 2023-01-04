import {
	OfOperatorDrawer,
	FromOperatorDrawer,
	SubscriberDrawer,
	FilterOperatorDrawer,
	DrawerProps,
	IntervalOperatorDrawer,
	ResultDrawer,
} from '../../drawers';
import { CatchErrorOperatorDrawer } from '../../drawers/errorHandlingOperators';
import { Element, ElementType, Result } from '../../model';

const createFromDrawer = (props: DrawerProps) => <FromOperatorDrawer {...props} />;

const createOfDrawer = (props: DrawerProps) => <OfOperatorDrawer {...props} />;

const createIntervalDrawer = (props: DrawerProps) => <IntervalOperatorDrawer {...props} />;

const createFilterOperatorDrawer = (props: DrawerProps) => <FilterOperatorDrawer {...props} />;

const createSubscriberDrawer = (props: DrawerProps) => <SubscriberDrawer {...props} />;

const createCatchErrorDrawer = (props: DrawerProps) => <CatchErrorOperatorDrawer {...props} />;

const createResultDrawer = (props: DrawerProps, el: Element) => {
	const resultElement = el as Result;
	return <ResultDrawer {...props} hash={resultElement.properties.hash} />;
};

const elementFactories = new Map<ElementType, (props: DrawerProps, el: Element) => JSX.Element>([
	[ElementType.Of, createOfDrawer],
	[ElementType.From, createFromDrawer],
	[ElementType.Interval, createIntervalDrawer],
	[ElementType.Filter, createFilterOperatorDrawer],
	[ElementType.Subscriber, createSubscriberDrawer],
	[ElementType.CatchError, createCatchErrorDrawer],
	[ElementType.Result, createResultDrawer],
]);

export type ElementDrawerFactory = ((props: DrawerProps, el: Element) => JSX.Element) | null;

export const findElementDrawerFactory = (elementType: ElementType): ElementDrawerFactory => {
	return elementFactories.get(elementType) ?? null;
};
