import Konva from 'konva';
import { TweenAnimation, Animation } from '../../../animation';
import { ThemeContext } from '../../../theme';

export const snapConnectPointAnimation = (node: Konva.Node, theme: ThemeContext): Animation =>
	new TweenAnimation({
		node,
		duration: 0.1,
		fill: theme.colors.tertiaryColor,
		scaleX: 1.4,
		scaleY: 1.4,
	});

