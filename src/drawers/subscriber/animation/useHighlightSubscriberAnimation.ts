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
) => {
	const mainShapeHighlightAnimation = useAnimation(mainShape, highlightDrawerAnimation);
	const innerShapeHighlightAnimation = useAnimation(
		innerShape,
		highlightSubscriberInnerAnimation,
	);
	return useAnimationGroups(mainShapeHighlightAnimation, innerShapeHighlightAnimation);
};

