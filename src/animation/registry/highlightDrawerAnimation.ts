import { Theme } from '../../theme';
import { AnimationTemplate } from '../AnimationTemplate';
import { AnimationKey } from './AnimationKey';

export const highlightDrawerAnimation = {
	key: AnimationKey.HighlightDrawer,
	factory: (theme: Theme): AnimationTemplate => ({
		key: AnimationKey.HighlightDrawer,
		mainShape: {
			duration: 0.2,
			fill: theme.drawer.highlightElement.primary.fill,
		},
		secondaryShape: {
			duration: 0.2,
			fill: theme.drawer.highlightElement.secondary.fill,
		},
		text: {
			duration: 0.2,
			stroke: theme.drawer.highlightText.stroke,
		},
		options: { autoReverse: true },
	}),
};
