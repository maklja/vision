import Konva from 'konva';
import { TweenAnimation, Animation } from '../../animation';
import { ThemeContext } from '../../theme';

export const errorDrawerAnimation = (node: Konva.Node, theme: ThemeContext): Animation =>
	new TweenAnimation({
		node,
		duration: 0.3,
		fill: theme.drawer.errorElement.fill,
		stroke: theme.drawer.errorElement.stroke,
	});

