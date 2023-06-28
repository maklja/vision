import { ConnectPointsDrawerProps, ConnectPointsDrawer } from '../../drawers';
import {
	ConnectPointType,
	Element,
	ElementType,
	creationOperators,
	calcConnectPointVisibility,
	pipeOperators,
	subscriberOperators,
	ConnectPointTypeVisibility,
} from '../../model';
import { SizeConfig } from '../../theme/sizes';

export type ConnectPointsDrawerFactory = (
	props: ConnectPointsDrawerProps,
	el: Element,
	sizeConfig: SizeConfig,
	cpVisibility: ConnectPointTypeVisibility,
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

const createPropsByElementDescriptor = (
	elType: ElementType,
	cpVisibility: ConnectPointTypeVisibility,
) => {
	const { inputVisible, eventsVisible, outputVisible } = calcConnectPointVisibility(elType);
	const visibleConnectPoints = {
		left: inputVisible && (cpVisibility.input ?? true),
		right: outputVisible && (cpVisibility.output ?? true),
		bottom: eventsVisible && (cpVisibility.event ?? true),
		top: eventsVisible && (cpVisibility.event ?? true),
	};
	return {
		visibleConnectPoints,
		connectionPointTypes: {
			left: inputVisible ? ConnectPointType.Input : null,
			right: outputVisible ? ConnectPointType.Output : null,
			top: eventsVisible ? ConnectPointType.Event : null,
			bottom: eventsVisible ? ConnectPointType.Event : null,
		},
	};
};

const creationOperatorConnectPointFactory: ConnectPointsDrawerFactory = (
	props: ConnectPointsDrawerProps,
	el: Element,
	sizeConfig: SizeConfig,
	cpVisibility: ConnectPointTypeVisibility,
) => {
	const position = createPositionForCircularOperator(el, sizeConfig.drawerSizes);
	return (
		<ConnectPointsDrawer
			{...props}
			{...createPropsByElementDescriptor(el.type, cpVisibility)}
			x={position.x}
			y={position.y}
			width={position.width}
			height={position.height}
			offset={position.offset}
		/>
	);
};

const pipeOperatorConnectPointFactory: ConnectPointsDrawerFactory = (
	props: ConnectPointsDrawerProps,
	el: Element,
	sizeConfig: SizeConfig,
	cpVisibility: ConnectPointTypeVisibility,
) => {
	const position = createPositionForPipeElement(el, sizeConfig.drawerSizes);
	return (
		<ConnectPointsDrawer
			{...props}
			{...createPropsByElementDescriptor(el.type, cpVisibility)}
			x={position.x}
			y={position.y}
			width={position.width}
			height={position.height}
			offset={position.offset}
		/>
	);
};

const subscriberOperatorConnectPointFactory: ConnectPointsDrawerFactory = (
	props: ConnectPointsDrawerProps,
	el: Element,
	sizeConfig: SizeConfig,
	cpVisibility: ConnectPointTypeVisibility,
) => {
	const position = createPositionForSubscriberElement(el, sizeConfig.drawerSizes);
	return (
		<ConnectPointsDrawer
			{...props}
			{...createPropsByElementDescriptor(el.type, cpVisibility)}
			x={position.x}
			y={position.y}
			width={position.width}
			height={position.height}
			offset={position.offset}
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

