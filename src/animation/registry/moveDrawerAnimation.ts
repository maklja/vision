import { Point } from '../../model';
import { ThemeContext } from '../../theme';
import { AnimationTemplate } from '../AnimationTemplate';
import { AnimationKey } from './AnimationKey';

export interface MoveAnimation {
	targetPosition: Point;
	sourcePosition: Point;
}

export const moveDrawerAnimation = {
	key: AnimationKey.MoveDrawer,
	factory: (
		_: ThemeContext,
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
			mainShape: {
				duration,
				x: targetPosition.x,
				y: targetPosition.y,
			},
		};
	},
};
