import { TweenAnimationConfig } from '..';
import { ThemeContext } from '../../theme';
import { AnimationKey } from './AnimationKey';

export const highlightDrawerAnimation = {
	key: AnimationKey.HighlightDrawer,
	factory: (theme: ThemeContext): TweenAnimationConfig => ({
		mainShape: {
			duration: 0.3,
			fill: theme.drawer.highlightElement.fill,
		},
		secondaryShape: {
			duration: 0.3,
			fill: theme.colors.primaryColor,
		},
		text: {
			duration: 0.3,
			stroke: theme.drawer.highlightText.stroke,
		},
		options: { autoReverse: true },
	}),
};
