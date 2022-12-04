import { TweenAnimationConfig } from '..';
import { ThemeContext } from '../../theme';
import { AnimationKey } from './AnimationKey';

export const errorDrawerAnimation = {
	key: AnimationKey.ErrorDrawer,
	factory: (theme: ThemeContext): TweenAnimationConfig => ({
		mainShape: {
			duration: 0.3,
			fill: theme.drawer.errorElement.fill,
			stroke: theme.drawer.errorElement.stroke,
		},
		text: {
			duration: 0.3,
			stroke: theme.drawer.errorText.stroke,
		},
		options: { autoReverse: true },
	}),
};
