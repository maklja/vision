import {
	ConnectPointPosition,
	ConnectPointType,
	ConnectPointTypeVisibility,
	ElementType,
	calcConnectPointVisibility,
} from '../model';
import { useConnectPointHandlers } from './state';
import { useAppSelector } from '../store/rootState';
import {
	selectElementSelection,
	selectHighlightedConnectPointsByElementId,
	useThemeContext,
} from '../store/stageSlice';
import {
	CircleConnectPointsDrawer,
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
import { DrawerAnimation, selectDrawerAnimationById } from '../store/drawerAnimationsSlice';
import { DrawerAnimationTemplate, animationRegistry } from '../animation';

export const createDefaultElementProps = <T extends ShapeSize>(
	elType: ElementType,
	shapeSize: T,
): ConnectPointsOptions<T> => {
	const { inputVisible, eventsVisible, outputVisible } = calcConnectPointVisibility(elType);
	return {
		left: {
			type: ConnectPointType.Input,
			visible: inputVisible,
			shapeSize,
			icon: ({ connectPointPosition, theme, highlight }) => {
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
			},
		},
		right: {
			type: ConnectPointType.Output,
			visible: outputVisible,
			shapeSize,
			icon: ({ connectPointPosition, theme, highlight }) => {
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
			},
		},
		top: {
			type: ConnectPointType.Event,
			visible: eventsVisible,
			shapeSize,
			icon: ({ connectPointPosition, theme, highlight }) => {
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
			},
		},
		bottom: {
			type: ConnectPointType.Event,
			visible: eventsVisible,
			shapeSize,
			icon: ({ connectPointPosition, theme, highlight }) => {
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
			},
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

	const leftAnimation = useAppSelector(selectDrawerAnimationById(leftAnimationId));
	const rightAnimation = useAppSelector(selectDrawerAnimationById(rightAnimationId));
	const topAnimation = useAppSelector(selectDrawerAnimationById(topAnimationId));
	const bottomAnimation = useAppSelector(selectDrawerAnimationById(bottomAnimationId));

	return {
		...defaultCPOptions,
		left: {
			...defaultCPOptions.left,
			visible: defaultCPOptions.left.visible && (cpVisibility.input ?? true),
			animation: createAnimationConfig(leftAnimation, theme),
		},
		right: {
			...defaultCPOptions.right,
			visible: defaultCPOptions.right.visible && (cpVisibility.output ?? true),
			animation: createAnimationConfig(rightAnimation, theme),
		},
		top: {
			...defaultCPOptions.top,
			visible: defaultCPOptions.top.visible && (cpVisibility.event ?? true),
			animation: createAnimationConfig(topAnimation, theme),
		},
		bottom: {
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
	type: ElementType;
	shape: ShapeSize;
	connectPointsOptions: ConnectPointsOptions<CircleShapeSize>;
	offset?: number;
	visible?: boolean;
}

export const ConnectPointsDrawer = ({
	id,
	x,
	y,
	type,
	shape,
	connectPointsOptions,
	offset = 0,
	visible = false,
}: ConnectPointsDrawerProps) => {
	const theme = useThemeContext(type);
	const connectPointsHandlers = useConnectPointHandlers();
	const highlightedConnectPoints = useAppSelector(
		selectHighlightedConnectPointsByElementId(id),
	).map((cp) => cp.position);
	const elSelection = useAppSelector(selectElementSelection(id));
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