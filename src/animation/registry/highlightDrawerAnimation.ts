import { Theme } from '../../theme';
import { AnimationTemplate } from '../AnimationTemplate';
import { AnimationKey } from './AnimationKey';

export const highlightDrawerAnimation = {
	key: AnimationKey.HighlightDrawer,
	factory: (theme: Theme): AnimationTemplate => ({
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

