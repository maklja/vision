import { Theme } from '../../theme';
import { AnimationTemplate } from '../AnimationTemplate';
import { AnimationKey } from './AnimationKey';

export const errorDrawerAnimation = {
	key: AnimationKey.ErrorDrawer,
	factory: (theme: Theme): AnimationTemplate => ({
		mainShape: {
			duration: 0.3,
			fill: theme.drawer.errorElement.fill,
			stroke: theme.drawer.errorElement.stroke,
		},
		text: {
			duration: 0.3,
			stroke: theme.drawer.errorText.stroke,
		},
		options: { autoReverse: false },
	}),
};

