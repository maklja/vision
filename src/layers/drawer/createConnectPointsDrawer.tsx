import {
	ConnectPointsDrawerProps,
	ConnectPointsDrawer,
	ConnectPointsOptions,
	CheckIconDrawer,
	CloseIconDrawer,
} from '../../drawers';
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

const createDefaultElementProps = (
	elType: ElementType,
	cpVisibility: ConnectPointTypeVisibility,
): ConnectPointsOptions => {
	const { inputVisible, eventsVisible, outputVisible } = calcConnectPointVisibility(elType);
	return {
		left: {
			type: ConnectPointType.Input,
			visible: inputVisible && (cpVisibility.input ?? true),
		},
		right: {
			type: ConnectPointType.Output,
			visible: outputVisible && (cpVisibility.output ?? true),
		},
		top: {
			type: ConnectPointType.Event,
			visible: eventsVisible && (cpVisibility.event ?? true),
		},
		bottom: {
			type: ConnectPointType.Event,
			visible: eventsVisible && (cpVisibility.event ?? true),
		},
	};
};

const createIifOperatorProps = (
	elType: ElementType,
	cpVisibility: ConnectPointTypeVisibility,
): ConnectPointsOptions => {
	const { inputVisible, eventsVisible, outputVisible } = calcConnectPointVisibility(elType);
	return {
		left: {
			type: ConnectPointType.Input,
			visible: inputVisible && (cpVisibility.input ?? true),
		},
		right: {
			type: ConnectPointType.Output,
			visible: outputVisible && (cpVisibility.output ?? true),
		},
		top: {
			type: ConnectPointType.Event,
			visible: eventsVisible && (cpVisibility.event ?? true),
			createIcon: (props) => <CheckIconDrawer {...props} />,
		},
		bottom: {
			type: ConnectPointType.Event,
			visible: eventsVisible && (cpVisibility.event ?? true),
			createIcon: (props) => <CloseIconDrawer {...props} />,
		},
	};
};

const createPropsByElementDescriptor = (
	elType: ElementType,
	cpVisibility: ConnectPointTypeVisibility,
): ConnectPointsOptions => {
	switch (elType) {
		case ElementType.IIf:
			return createIifOperatorProps(elType, cpVisibility);
		default:
			return createDefaultElementProps(elType, cpVisibility);
	}
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
			connectPointsOptions={createPropsByElementDescriptor(el.type, cpVisibility)}
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
			connectPointsOptions={createPropsByElementDescriptor(el.type, cpVisibility)}
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
			connectPointsOptions={createPropsByElementDescriptor(el.type, cpVisibility)}
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

