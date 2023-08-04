import { useEffect } from 'react';
import { Animation } from '../Animation';

export interface AnimationEffectEvent {
	animationId: string;
	drawerId: string;
}

export interface AnimationEffectOptions {
	onAnimationBegin?: (event: AnimationEffectEvent) => void;
	onAnimationComplete?: (event: AnimationEffectEvent) => void;
	onAnimationDestroy?: (event: AnimationEffectEvent) => void;
	drawerId: string;
}

export const useAnimationEffect = (animation: Animation | null, options: AnimationEffectOptions) =>
	useEffect(() => {
		if (!animation) {
			return;
		}

		const {
			drawerId,
			onAnimationBegin: onAnimationStart,
			onAnimationComplete: onAnimationFinish,
			onAnimationDestroy,
		} = options;

		animation.onAnimationBegin = (animation) =>
			onAnimationStart?.({
				animationId: animation.id,
				drawerId,
			});
		animation.onAnimationComplete = () =>
			onAnimationFinish?.({
				animationId: animation.id,
				drawerId,
			});

		animation.onAnimationDestroy = () =>
			onAnimationDestroy?.({
				animationId: animation.id,
				drawerId,
			});

		return () => {
			animation.onAnimationBegin = null;
			animation.onAnimationComplete = null;
			animation.onAnimationDestroy = null;
		};
	}, [animation]);
