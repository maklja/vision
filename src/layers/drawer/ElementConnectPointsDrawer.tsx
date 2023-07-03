import { DrawerAnimationTemplate, animationRegistry } from '../../animation';
import { ConnectPointAnimations, createConnectPointDrawerId } from '../../drawers';
import { ConnectPointPosition, Element } from '../../model';
import { DrawerAnimation, selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import {
	selectElementSelection,
	selectHighlightedConnectPointsByElementId,
	useThemeContext,
} from '../../store/stageSlice';
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
	const leftAnimationId = createConnectPointDrawerId(drawerId, ConnectPointPosition.Left);
	const rightAnimationId = createConnectPointDrawerId(drawerId, ConnectPointPosition.Right);
	const topAnimationId = createConnectPointDrawerId(drawerId, ConnectPointPosition.Top);
	const bottomAnimationId = createConnectPointDrawerId(drawerId, ConnectPointPosition.Bottom);

	const leftAnimation = useAppSelector(selectDrawerAnimationById(leftAnimationId));
	const rightAnimation = useAppSelector(selectDrawerAnimationById(rightAnimationId));
	const topAnimation = useAppSelector(selectDrawerAnimationById(topAnimationId));
	const bottomAnimation = useAppSelector(selectDrawerAnimationById(bottomAnimationId));

	return {
		[ConnectPointPosition.Left]: createAnimationConfig(leftAnimation, theme),
		[ConnectPointPosition.Right]: createAnimationConfig(rightAnimation, theme),
		[ConnectPointPosition.Top]: createAnimationConfig(topAnimation, theme),
		[ConnectPointPosition.Bottom]: createAnimationConfig(bottomAnimation, theme),
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
	).map((cp) => cp.position);
	const elSelection = useAppSelector(selectElementSelection(element.id));
	const connectPointDrawerFactory = findConnectPointsDrawerFactory(element.type);
	const sizeConfig = useSizes(theme, element.size);
	const connectPointAnimations = retrieveConnectPointAnimation(element.id, theme);

	if (!elSelection || !connectPointDrawerFactory) {
		return null;
	}

	return connectPointDrawerFactory(
		{
			...connectPointsHandlers,
			id: element.id,
			theme,
			connectPointAnimations,
			highlightedConnectPoints,
		},
		element,
		sizeConfig,
		elSelection.visibleConnectPoints,
	);
};

