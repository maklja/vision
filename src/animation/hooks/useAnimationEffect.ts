import { useEffect } from 'react';
import { Animation } from '../Animation';

export interface AnimationEffectEvent {
	animationId: string;
	drawerId: string;
	simulationId?: string;
}

export interface AnimationEffectOptions {
	onAnimationBegin?: (event: AnimationEffectEvent) => void;
	onAnimationComplete?: (event: AnimationEffectEvent) => void;
	onAnimationDestroy?: (event: AnimationEffectEvent) => void;
	simulationId?: string;
	drawerId: string;
}

export const useAnimationEffect = (animation: Animation | null, options: AnimationEffectOptions) =>
	useEffect(() => {
		if (!animation) {
			return;
		}

		const {
			drawerId,
			simulationId,
			onAnimationBegin: onAnimationStart,
			onAnimationComplete: onAnimationFinish,
			onAnimationDestroy,
		} = options;

		animation.onAnimationBegin = (animation) =>
			onAnimationStart?.({
				animationId: animation.id,
				drawerId,
				simulationId,
			});
		animation.onAnimationComplete = () =>
			onAnimationFinish?.({
				animationId: animation.id,
				drawerId,
				simulationId,
			});

		animation.onAnimationDestroy = () =>
			onAnimationDestroy?.({
				animationId: animation.id,
				drawerId,
				simulationId,
			});

		return () => {
			animation.onAnimationBegin = null;
			animation.onAnimationComplete = null;
			animation.onAnimationDestroy = null;
		};
	}, [animation]);
