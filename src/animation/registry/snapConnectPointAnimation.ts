import { Theme } from '../../theme';
import { AnimationTemplate } from '../AnimationTemplate';
import { AnimationKey } from './AnimationKey';

export const snapConnectPointAnimation = {
	key: AnimationKey.SnapConnectPoint,
	factory: (theme: Theme): AnimationTemplate => ({
		key: AnimationKey.SnapConnectPoint,
		mainShape: {
			duration: 0.1,
			fill: theme.colors.tertiaryColor,
			scaleX: 0.9,
			scaleY: 0.9,
		},
	}),
};
