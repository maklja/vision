import { Theme } from '../../theme';
import { AnimationTemplate } from '../AnimationTemplate';
import { AnimationKey } from './AnimationKey';

export const errorDrawerAnimation = {
	key: AnimationKey.ErrorDrawer,
	factory: (theme: Theme): AnimationTemplate => ({
		key: AnimationKey.HighlightDrawer,
		mainShape: {
			duration: 0.2,
			fill: theme.drawer.errorElement.primary.fill,
			stroke: theme.drawer.errorElement.primary.stroke,
		},
		text: {
			duration: 0.2,
			stroke: theme.drawer.errorText.stroke,
		},
		options: { autoReverse: false },
	}),
};
