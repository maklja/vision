import { DrawerProps, CircleDrawerProps } from '../drawers';
import { ElementType, ResultProperties } from '../model';
import { useCircleShapeSize } from '../store/stageSlice';

// const createMergeDrawer = (props: DrawerProps) => <MergeOperatorDrawer {...props} />;

// const createFromDrawer = (props: DrawerProps) => <FromOperatorDrawer {...props} />;

// const createOfDrawer = (props: DrawerProps) => <OfOperatorDrawer {...props} />;

// const createIntervalDrawer = (props: DrawerProps) => <IntervalOperatorDrawer {...props} />;

// const createIifDrawer = (props: DrawerProps) => <IifOperatorDrawer {...props} />;

// const createFilterOperatorDrawer = (props: DrawerProps) => <FilterOperatorDrawer {...props} />;

// const createSubscriberDrawer = (props: DrawerProps) => {
// 	const circleShapeSizes = useCircleShapeSize(ElementType.Subscriber);
// 	return <SubscriberDrawer {...props} size1={circleShapeSizes} />;
// };

// const createCatchErrorDrawer = (props: DrawerProps) => <CatchErrorOperatorDrawer {...props} />;

// const createResultDrawer = (props: DrawerProps, elProperties: unknown) => {
// 	const resultProperties = elProperties as ResultProperties;
// 	return <ResultDrawer {...props} hash={resultProperties.hash} />;
// };

export type ElementDrawerFactory = (props: DrawerProps, elProperties?: unknown) => JSX.Element;

const elementFactories = new Map<ElementType, ElementDrawerFactory>([
	// [ElementType.Merge, createMergeDrawer],
	// [ElementType.Of, createOfDrawer],
	// [ElementType.From, createFromDrawer],
	// [ElementType.Interval, createIntervalDrawer],
	// [ElementType.IIf, createIifDrawer],
	// [ElementType.Filter, createFilterOperatorDrawer],
	// [ElementType.Subscriber, createSubscriberDrawer],
	// [ElementType.CatchError, createCatchErrorDrawer],
	// [ElementType.Result, createResultDrawer],
]);

export const findElementDrawerFactory = (elementType: ElementType): ElementDrawerFactory | null => {
	return elementFactories.get(elementType) ?? null;
};

