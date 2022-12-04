import { TweenAnimationConfig } from '..';
import { ThemeContext } from '../../theme';
import { AnimationKey } from './AnimationKey';

export const snapConnectPointAnimation = {
	key: AnimationKey.SnapConnectPoint,
	factory: (theme: ThemeContext): TweenAnimationConfig => ({
		mainShape: {
			duration: 0.1,
			fill: theme.colors.tertiaryColor,
			scaleX: 1.4,
			scaleY: 1.4,
		},
	}),
};
