import { ConnectPointPosition, ConnectPointTypeVisibility, Element } from '../model';
import { useConnectPointHandlers } from '../layers/drawers/state';
import { useAppSelector } from '../store/rootState';
import {
	selectElementSelection,
	selectHighlightedConnectPointsByElementId,
	useThemeContext,
} from '../store/stageSlice';
import { ConnectPointsDrawer, ConnectPointsOptions, createConnectPointDrawerId } from '../drawers';
import { Shapes, Theme, calculateShapeSizeBoundingBox } from '../theme';
import { createConnectPointsProps } from '../layers/drawers/connectPoints';
import { DrawerAnimation, selectDrawerAnimationById } from '../store/drawerAnimationsSlice';
import { DrawerAnimationTemplate, animationRegistry } from '../animation';

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
	el: Element,
	theme: Theme,
	cpVisibility: ConnectPointTypeVisibility = {
		input: false,
		event: false,
		output: false,
	},
): ConnectPointsOptions => {
	const defaultProps = createConnectPointsProps(el.type);
	const leftAnimationId = createConnectPointDrawerId(el.id, ConnectPointPosition.Left);
	const rightAnimationId = createConnectPointDrawerId(el.id, ConnectPointPosition.Right);
	const topAnimationId = createConnectPointDrawerId(el.id, ConnectPointPosition.Top);
	const bottomAnimationId = createConnectPointDrawerId(el.id, ConnectPointPosition.Bottom);

	const leftAnimation = useAppSelector(selectDrawerAnimationById(leftAnimationId));
	const rightAnimation = useAppSelector(selectDrawerAnimationById(rightAnimationId));
	const topAnimation = useAppSelector(selectDrawerAnimationById(topAnimationId));
	const bottomAnimation = useAppSelector(selectDrawerAnimationById(bottomAnimationId));

	return {
		...defaultProps,
		left: {
			...defaultProps.left,
			visible: defaultProps.left.visible && (cpVisibility.input ?? true),
			animation: createAnimationConfig(leftAnimation, theme),
		},
		right: {
			...defaultProps.right,
			visible: defaultProps.right.visible && (cpVisibility.output ?? true),
			animation: createAnimationConfig(rightAnimation, theme),
		},
		top: {
			...defaultProps.top,
			visible: defaultProps.top.visible && (cpVisibility.event ?? true),
			animation: createAnimationConfig(topAnimation, theme),
		},
		bottom: {
			...defaultProps.bottom,
			visible: defaultProps.bottom.visible && (cpVisibility.event ?? true),
			animation: createAnimationConfig(bottomAnimation, theme),
		},
	};
};

export interface ConnectPointsWrapperDrawerProps {
	element: Element;
	shape: Shapes;
	offset?: number;
}

export const ConnectPointsWrapperDrawer = ({
	element,
	shape,
	offset = 0,
}: ConnectPointsWrapperDrawerProps) => {
	const theme = useThemeContext(element.type);
	const connectPointsHandlers = useConnectPointHandlers();
	const highlightedConnectPoints = useAppSelector(
		selectHighlightedConnectPointsByElementId(element.id),
	).map((cp) => cp.position);
	const elSelection = useAppSelector(selectElementSelection(element.id));
	const connectPointsOptions = createConnectPointsOptions(
		element,
		theme,
		elSelection?.visibleConnectPoints,
	);
	const bb = calculateShapeSizeBoundingBox({ x: element.x, y: element.y }, shape);

	return (
		<ConnectPointsDrawer
			{...connectPointsHandlers}
			id={element.id}
			theme={theme}
			connectPointsOptions={connectPointsOptions}
			highlightedConnectPoints={highlightedConnectPoints}
			x={bb.x}
			y={bb.y}
			width={bb.width}
			height={bb.height}
			offset={offset}
		/>
	);
};

