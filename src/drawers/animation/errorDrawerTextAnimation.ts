import Konva from 'konva';
import { TweenAnimation, Animation } from '../../animation';
import { ThemeContext } from '../../theme';

export const errorDrawerTextAnimation = (node: Konva.Node, theme: ThemeContext): Animation =>
	new TweenAnimation(
		{
			node,
			duration: 0.3,
			stroke: theme.drawer.errorText.stroke,
		}
	);

