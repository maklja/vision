import { DrawerAnimationTemplate, animationRegistry } from '../../animation';
import {
	ConnectPointAnimations,
	ConnectPointsDrawer,
	createConnectPointDrawerId,
} from '../../drawers';
import { ConnectPointType, Element, ElementType, isPipeOperatorType } from '../../model';
import { DrawerAnimation, selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import { selectHighlightedConnectPointsByElementId, useThemeContext } from '../../store/stageSlice';
import { ThemeContext, useSizes } from '../../theme';
import { useConnectPointHandlers } from './state';

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
	offset: 32,
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
	offset: 24,
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
	offset: 12,
});

const createPosition = (
	element: Element,
	drawerSizes: {
		width: number;
		height: number;
		radius: number;
	},
) => {
	if (element.type === ElementType.Subscriber) {
		return createPositionForSubscriberElement(element, drawerSizes);
	}

	if (isPipeOperatorType(element.type)) {
		return createPositionForPipeElement(element, drawerSizes);
	}

	return createPositionForCircularOperator(element, drawerSizes);
};

const createAnimationConfig = (
	animation: DrawerAnimation | null,
	theme: ThemeContext,
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

const retrieveConnectPointAnimation = (
	drawerId: string,
	theme: ThemeContext,
): ConnectPointAnimations => {
	const leftAnimationId = createConnectPointDrawerId(drawerId, ConnectPointType.Left);
	const rightAnimationId = createConnectPointDrawerId(drawerId, ConnectPointType.Right);
	const topAnimationId = createConnectPointDrawerId(drawerId, ConnectPointType.Top);
	const bottomAnimationId = createConnectPointDrawerId(drawerId, ConnectPointType.Bottom);

	const leftAnimation = useAppSelector(selectDrawerAnimationById(leftAnimationId));
	const rightAnimation = useAppSelector(selectDrawerAnimationById(rightAnimationId));
	const topAnimation = useAppSelector(selectDrawerAnimationById(topAnimationId));
	const bottomAnimation = useAppSelector(selectDrawerAnimationById(bottomAnimationId));

	return {
		[ConnectPointType.Left]: createAnimationConfig(leftAnimation, theme),
		[ConnectPointType.Right]: createAnimationConfig(rightAnimation, theme),
		[ConnectPointType.Top]: createAnimationConfig(topAnimation, theme),
		[ConnectPointType.Bottom]: createAnimationConfig(bottomAnimation, theme),
	};
};

export interface ElementConnectPointsDrawerProps {
	element: Element;
}

export const ElementConnectPointsDrawer = ({ element }: ElementConnectPointsDrawerProps) => {
	const { id, size } = element;
	const theme = useThemeContext();
	const connectPointsHandlers = useConnectPointHandlers();
	const highlightedConnectPoints = useAppSelector(
		selectHighlightedConnectPointsByElementId(id),
	).map((cp) => cp.type);
	const { drawerSizes } = useSizes(theme, size);

	const position = createPosition(element, drawerSizes);
	return (
		<ConnectPointsDrawer
			{...connectPointsHandlers}
			id={id}
			x={position.x}
			y={position.y}
			width={position.width}
			height={position.height}
			theme={theme}
			offset={position.offset}
			connectPointAnimations={retrieveConnectPointAnimation(element.id, theme)}
			highlightedConnectPoints={highlightedConnectPoints}
		/>
	);
};
