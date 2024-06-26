import { Point } from '@maklja/vision-simulator-model';
import { Theme } from '../../theme';
import { AnimationTemplate } from '../AnimationTemplate';
import { AnimationKey } from './AnimationKey';

export interface MoveAnimation {
	targetPosition: Point;
	sourcePosition: Point;
}

export const moveDrawerAnimation = {
	key: AnimationKey.MoveDrawer,
	factory: (
		_theme: Theme,
		data: unknown = {
			sourcePosition: { x: 0, y: 0 },
			targetPosition: { x: 0, y: 0 },
		},
	): AnimationTemplate => {
		const { sourcePosition, targetPosition } = data as MoveAnimation;

		const duration =
			Math.sqrt(
				Math.pow(targetPosition.x - sourcePosition.x, 2) +
					Math.pow(targetPosition.y - sourcePosition.y, 2),
			) / 250;
		return {
			key: AnimationKey.MoveDrawer,
			mainShape: {
				duration,
				x: targetPosition.x,
				y: targetPosition.y,
			},
		};
	},
};
