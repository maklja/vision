import { ConnectPointsDrawerProps, ConnectPointsDrawer } from '../../drawers';
import {
	Element,
	ElementType,
	creationOperators,
	findElementDescriptor,
	pipeOperators,
	subscriberOperators,
} from '../../model';
import { SizeConfig } from '../../theme/sizes';

export type ConnectPointsDrawerFactory = (
	props: ConnectPointsDrawerProps,
	el: Element,
	sizeConfig: SizeConfig,
) => JSX.Element;

const createPositionForCircularOperator = (
	element: Element,
	drawerSizes: {
		width: number;
		height: number;
		radius: number;
	},
) => ({
	x: element.x + drawerSizes.radius / 2,
	y: element.y + drawerSizes.radius / 2,
	width: drawerSizes.radius,
	height: drawerSizes.radius,
	offset: 50,
});

const createPositionForPipeElement = (
	element: Element,
	drawerSizes: {
		width: number;
		height: number;
		radius: number;
	},
) => ({
	x: element.x,
	y: element.y,
	width: drawerSizes.width,
	height: drawerSizes.height,
	offset: 26,
});

const createPositionForSubscriberElement = (
	element: Element,
	drawerSizes: {
		width: number;
		height: number;
		radius: number;
	},
) => ({
	x: element.x + drawerSizes.radius / 2,
	y: element.y + drawerSizes.radius / 2,
	width: drawerSizes.radius,
	height: drawerSizes.radius,
	offset: 42,
});

const creationOperatorConnectPointFactory: ConnectPointsDrawerFactory = (
	props: ConnectPointsDrawerProps,
	el: Element,
	sizeConfig: SizeConfig,
) => {
	const position = createPositionForCircularOperator(el, sizeConfig.drawerSizes);
	const { input, event, output } = findElementDescriptor(el.type);

	const inputVisible = Boolean(input?.cardinality);
	const outputVisible = Boolean(output?.cardinality);
	const eventsVisible = Boolean(event?.cardinality);
	return (
		<ConnectPointsDrawer
			{...props}
			x={position.x}
			y={position.y}
			width={position.width}
			height={position.height}
			offset={position.offset}
			visibleConnectPoints={{
				left: inputVisible,
				right: outputVisible,
				bottom: eventsVisible,
				top: eventsVisible,
			}}
		/>
	);
};

const pipeOperatorConnectPointFactory: ConnectPointsDrawerFactory = (
	props: ConnectPointsDrawerProps,
	el: Element,
	sizeConfig: SizeConfig,
) => {
	const position = createPositionForPipeElement(el, sizeConfig.drawerSizes);
	const { input, event, output } = findElementDescriptor(el.type);

	const inputVisible = Boolean(input?.cardinality);
	const outputVisible = Boolean(output?.cardinality);
	const eventsVisible = Boolean(event?.cardinality);
	return (
		<ConnectPointsDrawer
			{...props}
			x={position.x}
			y={position.y}
			width={position.width}
			height={position.height}
			offset={position.offset}
			visibleConnectPoints={{
				left: inputVisible,
				right: outputVisible,
				bottom: eventsVisible,
				top: eventsVisible,
			}}
		/>
	);
};

const subscriberOperatorConnectPointFactory: ConnectPointsDrawerFactory = (
	props: ConnectPointsDrawerProps,
	el: Element,
	sizeConfig: SizeConfig,
) => {
	const position = createPositionForSubscriberElement(el, sizeConfig.drawerSizes);
	const { input, event, output } = findElementDescriptor(el.type);

	const inputVisible = Boolean(input?.cardinality);
	const outputVisible = Boolean(output?.cardinality);
	const eventsVisible = Boolean(event?.cardinality);
	return (
		<ConnectPointsDrawer
			{...props}
			x={position.x}
			y={position.y}
			width={position.width}
			height={position.height}
			offset={position.offset}
			visibleConnectPoints={{
				left: inputVisible,
				right: outputVisible,
				bottom: eventsVisible,
				top: eventsVisible,
			}}
		/>
	);
};

const creationOperatorFactories = [...creationOperators].map<
	[ElementType, ConnectPointsDrawerFactory]
>((elType) => [elType, creationOperatorConnectPointFactory]);

const pipeOperatorFactories = [...pipeOperators].map<[ElementType, ConnectPointsDrawerFactory]>(
	(elType) => [elType, pipeOperatorConnectPointFactory],
);

const subscriberOperatorFactories = [...subscriberOperators].map<
	[ElementType, ConnectPointsDrawerFactory]
>((elType) => [elType, subscriberOperatorConnectPointFactory]);

const connectPointsFactory = new Map<ElementType, ConnectPointsDrawerFactory>([
	...creationOperatorFactories,
	...pipeOperatorFactories,
	...subscriberOperatorFactories,
]);

export const findConnectPointsDrawerFactory = (
	elementType: ElementType,
): ConnectPointsDrawerFactory | null => {
	return connectPointsFactory.get(elementType) ?? null;
};

