import { useEffect } from 'react';
import { Animation } from '../Animation';

export interface AnimationEffectOptions {
	onAnimationBegin?: (animation: Animation) => void;
	onAnimationComplete?: (animation: Animation) => void;
	onAnimationDestroy?: (animation: Animation) => void;
}

export const useAnimationEffect = (animation: Animation | null, options: AnimationEffectOptions) =>
	useEffect(() => {
		if (!animation) {
			return;
		}

		const {
			onAnimationBegin: onAnimationStart,
			onAnimationComplete: onAnimationFinish,
			onAnimationDestroy,
		} = options;

		animation.onAnimationBegin = (animation) => onAnimationStart?.(animation);
		animation.onAnimationComplete = (animation) => onAnimationFinish?.(animation);
		animation.onAnimationDestroy = (animation) => onAnimationDestroy?.(animation);

		return () => {
			animation.onAnimationBegin = null;
			animation.onAnimationComplete = null;
			animation.onAnimationDestroy = null;
		};
	}, [animation]);
