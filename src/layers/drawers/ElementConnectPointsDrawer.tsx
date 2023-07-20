import { DrawerAnimationTemplate, animationRegistry } from '../../animation';
import { ConnectPointsOptions, createConnectPointDrawerId } from '../../drawers';
import { ConnectPointPosition, ConnectPointTypeVisibility, Element } from '../../model';
import { DrawerAnimation, selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import {
	selectElementSelection,
	selectHighlightedConnectPointsByElementId,
	useThemeContext,
} from '../../store/stageSlice';
import { Theme, useSizes } from '../../theme';
import { findConnectPointsDrawerFactory } from '../../factory';
import { useConnectPointHandlers } from './state';
import { createConnectPointsProps } from './connectPoints';

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

export interface ElementConnectPointsDrawerProps {
	element: Element;
}

export const ElementConnectPointsDrawer = ({ element }: ElementConnectPointsDrawerProps) => {
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
	const connectPointDrawerFactory = findConnectPointsDrawerFactory(element.type);
	const sizeConfig = useSizes(theme, element.size);

	if (!connectPointDrawerFactory) {
		return null;
	}

	return connectPointDrawerFactory(
		{
			...connectPointsHandlers,
			id: element.id,
			theme,
			highlightedConnectPoints,
			connectPointsOptions,
		},
		element,
		sizeConfig,
	);
};
