import { ReactNode } from 'react';
import { ConnectPointPosition, ConnectPoints, ElementType } from '@maklja/vision-simulator-model';
import { useConnectPointHandlers } from './state';
import {
	CircleConnectPointsDrawer,
	ConnectPointIconDrawerProps,
	ConnectPointsOptions,
	EventCircleIconDrawer,
	InputCircleIconDrawer,
	OutputCircleIconDrawer,
	createConnectPointDrawerId,
} from '../drawers';
import {
	CircleShapeSize,
	ElementShape,
	ShapeSize,
	Theme,
	calculateShapeSizeBoundingBox,
} from '../theme';
import { DrawerAnimationTemplate, animationRegistry } from '../animation';
import { selectElementConnectPointsById } from '../store/connectPoints';
import { DrawerAnimation, selectDrawerAnimationByDrawerId } from '../store/drawerAnimations';
import { useCircleShapeSize, useThemeContext } from '../store/hooks';
import { useRootStore } from '../store/rootStore';

export type ConnectPointsDrawerIconsProps = {
	[key in ConnectPointPosition]?: (props: ConnectPointIconDrawerProps) => ReactNode;
};

interface IconDrawerProps extends ConnectPointIconDrawerProps {
	shapeSize: ShapeSize;
}

function DefaultInputIcon({ theme, connectPointPosition, highlight, shapeSize }: IconDrawerProps) {
	switch (shapeSize.type) {
		case ElementShape.Circle:
			return (
				<InputCircleIconDrawer
					connectPointPosition={connectPointPosition}
					theme={theme}
					highlight={highlight}
					size={shapeSize}
				/>
			);
		default:
			return null;
	}
}

function DefaultOutputIcon({ theme, connectPointPosition, highlight, shapeSize }: IconDrawerProps) {
	switch (shapeSize.type) {
		case ElementShape.Circle:
			return (
				<OutputCircleIconDrawer
					connectPointPosition={connectPointPosition}
					theme={theme}
					highlight={highlight}
					size={shapeSize}
				/>
			);
		default:
			return null;
	}
}

function DefaultEventIcon({ theme, connectPointPosition, highlight, shapeSize }: IconDrawerProps) {
	switch (shapeSize.type) {
		case ElementShape.Circle:
			return (
				<EventCircleIconDrawer
					connectPointPosition={connectPointPosition}
					theme={theme}
					highlight={highlight}
					size={shapeSize}
				/>
			);
		default:
			return null;
	}
}

const createDefaultElementProps = <T extends ShapeSize>(
	connectPoints: ConnectPoints,
	shapeSize: T,
	icons: ConnectPointsDrawerIconsProps,
): ConnectPointsOptions<T> => ({
	left: connectPoints.left && {
		...connectPoints.left,
		shapeSize,
		icon: (props) =>
			icons.left?.(props) ?? <DefaultInputIcon {...props} shapeSize={shapeSize} />,
	},
	right: connectPoints.right && {
		...connectPoints.right,
		shapeSize,
		icon: (props) =>
			icons.right?.(props) ?? <DefaultOutputIcon {...props} shapeSize={shapeSize} />,
	},
	top: connectPoints.top && {
		...connectPoints.top,
		shapeSize,
		icon: (props) =>
			icons.top?.(props) ?? <DefaultEventIcon {...props} shapeSize={shapeSize} />,
	},
	bottom: connectPoints.bottom && {
		...connectPoints.bottom,
		shapeSize,
		icon: (props) =>
			icons.bottom?.(props) ?? <DefaultEventIcon {...props} shapeSize={shapeSize} />,
	},
});

function createAnimationConfig(
	animation: DrawerAnimation | null,
	theme: Theme,
): DrawerAnimationTemplate | null {
	if (!animation) {
		return null;
	}

	return {
		...animationRegistry.retrieveAnimationConfig(animation.key)(theme),
		id: animation.id,
		dispose: animation.dispose,
	};
}

function createConnectPointsOptions(
	id: string,
	theme: Theme,
	defaultCPOptions: ConnectPointsOptions<CircleShapeSize>,
): ConnectPointsOptions<CircleShapeSize> {
	const leftAnimationId = createConnectPointDrawerId(id, ConnectPointPosition.Left);
	const rightAnimationId = createConnectPointDrawerId(id, ConnectPointPosition.Right);
	const topAnimationId = createConnectPointDrawerId(id, ConnectPointPosition.Top);
	const bottomAnimationId = createConnectPointDrawerId(id, ConnectPointPosition.Bottom);

	const leftAnimation = useRootStore(selectDrawerAnimationByDrawerId(leftAnimationId));
	const rightAnimation = useRootStore(selectDrawerAnimationByDrawerId(rightAnimationId));
	const topAnimation = useRootStore(selectDrawerAnimationByDrawerId(topAnimationId));
	const bottomAnimation = useRootStore(selectDrawerAnimationByDrawerId(bottomAnimationId));

	return {
		...defaultCPOptions,
		left: defaultCPOptions.left && {
			...defaultCPOptions.left,
			animation: createAnimationConfig(leftAnimation, theme),
		},
		right: defaultCPOptions.right && {
			...defaultCPOptions.right,
			animation: createAnimationConfig(rightAnimation, theme),
		},
		top: defaultCPOptions.top && {
			...defaultCPOptions.top,
			animation: createAnimationConfig(topAnimation, theme),
		},
		bottom: defaultCPOptions.bottom && {
			...defaultCPOptions.bottom,
			animation: createAnimationConfig(bottomAnimation, theme),
		},
	};
}

export interface ConnectPointsDrawerProps {
	id: string;
	x: number;
	y: number;
	scale: number;
	type: ElementType;
	shape: ShapeSize;
	visible?: boolean;
	icons?: ConnectPointsDrawerIconsProps;
}

export function ConnectPointsDrawer({
	id,
	x,
	y,
	scale,
	type,
	shape,
	visible = false,
	icons = {},
}: ConnectPointsDrawerProps) {
	const theme = useThemeContext(type);
	const connectPointsHandlers = useConnectPointHandlers();
	const connectPoints = useRootStore(selectElementConnectPointsById(id));
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint, scale);
	const connectPointsOptions = createDefaultElementProps(connectPoints, circleCPSize, icons);
	const mergedCPOptions = createConnectPointsOptions(id, theme, connectPointsOptions);
	const bb = calculateShapeSizeBoundingBox({ x, y }, shape);

	if (!visible) {
		return null;
	}

	return (
		<CircleConnectPointsDrawer
			{...connectPointsHandlers}
			id={id}
			theme={theme}
			connectPointsOptions={mergedCPOptions}
			x={bb.x}
			y={bb.y}
			width={bb.width}
			height={bb.height}
		/>
	);
}

