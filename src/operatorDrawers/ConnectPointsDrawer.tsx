import {
	ConnectPointPosition,
	ConnectPointTypeVisibility,
	ConnectPoints,
	ElementType,
} from '../model';
import { useConnectPointHandlers } from './state';
import { useAppSelector } from '../store/rootState';
import { useCircleShapeSize, useThemeContext } from '../store/stageSlice';
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
import { selectElementSelection } from '../store/elements';
import {
	selectElementConnectPointsById,
	selectHighlightedConnectPointsByElementId,
} from '../store/connectPoints';
import { DrawerAnimation, selectDrawerAnimationByDrawerId } from '../store/drawerAnimations';
import { ReactNode } from 'react';

export type ConnectPointsDrawerIconsProps = {
	[key in ConnectPointPosition]?: (props: ConnectPointIconDrawerProps) => ReactNode;
};

interface IconDrawerProps extends ConnectPointIconDrawerProps {
	shapeSize: ShapeSize;
}

const DefaultInputIcon = ({
	theme,
	connectPointPosition,
	highlight,
	shapeSize,
}: IconDrawerProps) => {
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
};

const DefaultOutputIcon = ({
	theme,
	connectPointPosition,
	highlight,
	shapeSize,
}: IconDrawerProps) => {
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
};

const DefaultEventIcon = ({
	theme,
	connectPointPosition,
	highlight,
	shapeSize,
}: IconDrawerProps) => {
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
};

export const createDefaultElementProps = <T extends ShapeSize>(
	connectPoints: ConnectPoints,
	shapeSize: T,
	icons: ConnectPointsDrawerIconsProps,
): ConnectPointsOptions<T> => {
	return {
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
	};
};

const createAnimationConfig = (
	animation: DrawerAnimation | null,
	theme: Theme,
): DrawerAnimationTemplate | null => {
	if (!animation) {
		return null;
	}

	return {
		...animationRegistry.retrieveAnimationConfig(animation.key)(theme),
		id: animation.id,
		dispose: animation.dispose,
	};
};

const createConnectPointsOptions = (
	id: string,
	theme: Theme,
	defaultCPOptions: ConnectPointsOptions<CircleShapeSize>,
	cpVisibility: ConnectPointTypeVisibility = {
		input: false,
		event: false,
		output: false,
	},
): ConnectPointsOptions<CircleShapeSize> => {
	const leftAnimationId = createConnectPointDrawerId(id, ConnectPointPosition.Left);
	const rightAnimationId = createConnectPointDrawerId(id, ConnectPointPosition.Right);
	const topAnimationId = createConnectPointDrawerId(id, ConnectPointPosition.Top);
	const bottomAnimationId = createConnectPointDrawerId(id, ConnectPointPosition.Bottom);

	const leftAnimation = useAppSelector(selectDrawerAnimationByDrawerId(leftAnimationId));
	const rightAnimation = useAppSelector(selectDrawerAnimationByDrawerId(rightAnimationId));
	const topAnimation = useAppSelector(selectDrawerAnimationByDrawerId(topAnimationId));
	const bottomAnimation = useAppSelector(selectDrawerAnimationByDrawerId(bottomAnimationId));

	return {
		...defaultCPOptions,
		left: defaultCPOptions.left && {
			...defaultCPOptions.left,
			visible: defaultCPOptions.left.visible && (cpVisibility.input ?? true),
			animation: createAnimationConfig(leftAnimation, theme),
		},
		right: defaultCPOptions.right && {
			...defaultCPOptions.right,
			visible: defaultCPOptions.right.visible && (cpVisibility.output ?? true),
			animation: createAnimationConfig(rightAnimation, theme),
		},
		top: defaultCPOptions.top && {
			...defaultCPOptions.top,
			visible: defaultCPOptions.top.visible && (cpVisibility.event ?? true),
			animation: createAnimationConfig(topAnimation, theme),
		},
		bottom: defaultCPOptions.bottom && {
			...defaultCPOptions.bottom,
			visible: defaultCPOptions.bottom.visible && (cpVisibility.event ?? true),
			animation: createAnimationConfig(bottomAnimation, theme),
		},
	};
};

export interface ConnectPointsDrawerProps {
	id: string;
	x: number;
	y: number;
	scale: number;
	type: ElementType;
	shape: ShapeSize;
	offset?: number;
	visible?: boolean;
	icons?: ConnectPointsDrawerIconsProps;
}

export const ConnectPointsDrawer = ({
	id,
	x,
	y,
	scale,
	type,
	shape,
	offset = 0,
	visible = false,
	icons = {},
}: ConnectPointsDrawerProps) => {
	const theme = useThemeContext(type);
	const connectPointsHandlers = useConnectPointHandlers();
	const connectPoints = useAppSelector(selectElementConnectPointsById(id));
	const highlightedConnectPoints = useAppSelector(
		selectHighlightedConnectPointsByElementId(id),
	).map((cp) => cp.position);
	const elSelection = useAppSelector(selectElementSelection(id));
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint, scale);
	const connectPointsOptions = createDefaultElementProps(connectPoints, circleCPSize, icons);

	const mergedCPOptions = createConnectPointsOptions(
		id,
		theme,
		connectPointsOptions,
		elSelection?.visibleConnectPoints,
	);
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
			highlightedConnectPoints={highlightedConnectPoints}
			x={bb.x}
			y={bb.y}
			width={bb.width}
			height={bb.height}
			offset={offset}
		/>
	);
};
