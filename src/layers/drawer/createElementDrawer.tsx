import {
	OfOperatorDrawer,
	FromOperatorDrawer,
	IntervalOperatorDrawer,
	IifOperatorDrawer,
	SubscriberDrawer,
	FilterOperatorDrawer,
	DrawerProps,
	ResultDrawer,
	CatchErrorOperatorDrawer,
	MergeOperatorDrawer,
} from '../../drawers';
import { Element, ElementType, Result } from '../../model';

const createMergeDrawer = (props: DrawerProps) => <MergeOperatorDrawer {...props} />;

const createFromDrawer = (props: DrawerProps) => <FromOperatorDrawer {...props} />;

const createOfDrawer = (props: DrawerProps) => <OfOperatorDrawer {...props} />;

const createIntervalDrawer = (props: DrawerProps) => <IntervalOperatorDrawer {...props} />;

const createIifDrawer = (props: DrawerProps) => <IifOperatorDrawer {...props} />;

const createFilterOperatorDrawer = (props: DrawerProps) => <FilterOperatorDrawer {...props} />;

const createSubscriberDrawer = (props: DrawerProps) => <SubscriberDrawer {...props} />;

const createCatchErrorDrawer = (props: DrawerProps) => <CatchErrorOperatorDrawer {...props} />;

const createResultDrawer = (props: DrawerProps, el: Element) => {
	const resultElement = el as Result;
	return <ResultDrawer {...props} hash={resultElement.properties.hash} />;
};

export type ElementDrawerFactory = (props: DrawerProps, el: Element) => JSX.Element;

const elementFactories = new Map<ElementType, ElementDrawerFactory>([
	[ElementType.Merge, createMergeDrawer],
	[ElementType.Of, createOfDrawer],
	[ElementType.From, createFromDrawer],
	[ElementType.Interval, createIntervalDrawer],
	[ElementType.IIf, createIifDrawer],
	[ElementType.Filter, createFilterOperatorDrawer],
	[ElementType.Subscriber, createSubscriberDrawer],
	[ElementType.CatchError, createCatchErrorDrawer],
	[ElementType.Result, createResultDrawer],
]);

export const findElementDrawerFactory = (elementType: ElementType): ElementDrawerFactory | null => {
	return elementFactories.get(elementType) ?? null;
};

