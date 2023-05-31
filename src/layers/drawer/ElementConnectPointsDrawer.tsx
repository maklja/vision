import { DrawerAnimationTemplate, animationRegistry } from '../../animation';
import { ConnectPointAnimations, createConnectPointDrawerId } from '../../drawers';
import { ConnectPointType, Element } from '../../model';
import { DrawerAnimation, selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import { selectHighlightedConnectPointsByElementId, useThemeContext } from '../../store/stageSlice';
import { ThemeContext, useSizes } from '../../theme';
import { findConnectPointsDrawerFactory } from './createConnectPointsDrawer';
import { useConnectPointHandlers } from './state';

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
	const theme = useThemeContext();
	const connectPointsHandlers = useConnectPointHandlers();
	const highlightedConnectPoints = useAppSelector(
		selectHighlightedConnectPointsByElementId(element.id),
	).map((cp) => cp.type);
	const connectPointDrawerFactory = findConnectPointsDrawerFactory(element.type);

	return connectPointDrawerFactory
		? connectPointDrawerFactory(
				{
					...connectPointsHandlers,
					id: element.id,
					theme: theme,
					connectPointAnimations: retrieveConnectPointAnimation(element.id, theme),
					highlightedConnectPoints,
				},
				element,
				useSizes(theme, element.size),
		  )
		: null;
};

