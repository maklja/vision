import { TweenAnimationConfig } from '../../animation';
import { ThemeContext } from '../../theme';

export const highlightDrawerAnimationNew = (theme: ThemeContext): TweenAnimationConfig => ({
	name: 'highlightDrawerAnimation',
	mainShape: {
		duration: 0.3,
		fill: theme.drawer.highlightElement.fill,
	},
	text: {
		duration: 0.3,
		stroke: theme.drawer.highlightText.stroke,
	},
	options: { autoReverse: true },
});

