import Konva from 'konva';
import { TweenAnimation, Animation, useAnimation, useAnimationGroups } from '../../../animation';
import { ThemeContext } from '../../../theme';
import { highlightDrawerAnimation } from '../../animation';

export const highlightSubscriberInnerAnimation = (
	node: Konva.Node,
	theme: ThemeContext,
): Animation =>
	new TweenAnimation(
		{
			node,
			duration: 0.3,
			fill: theme.colors.primaryColor,
		},
		{ autoReverse: true },
	);

export const useHighlightSubscriberAnimation = (
	mainShape: Konva.Node | null,
	innerShape: Konva.Node | null,
	theme: ThemeContext,
) => {
	const mainShapeHighlightAnimation = useAnimation(
		mainShape,
		(node) => highlightDrawerAnimation(node, theme),
		[theme],
	);
	const innerShapeHighlightAnimation = useAnimation(
		innerShape,
		(node) => highlightSubscriberInnerAnimation(node, theme),
		[theme],
	);
	return useAnimationGroups(mainShapeHighlightAnimation, innerShapeHighlightAnimation);
};

