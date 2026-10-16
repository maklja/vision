import Konva from 'konva';
import { useCallback, useEffect, useRef } from 'react';
import { TweenAnimation } from '../tween';
import { DrawerAnimationTemplate } from '../AnimationTemplate';
import { AnimationEffectEvent } from './AnimationEffectEvent';
import { AnimationGroup } from '../AnimationGroup';
import { Animation } from '../Animation';

export function useAnimation(
	animationTemplate: DrawerAnimationTemplate | null = null,
	animationParts: [Konva.Node | null, Konva.NodeConfig | undefined][],
	options: {
		drawerId: string;
		onAnimationBegin?: (event: AnimationEffectEvent) => void;
		onAnimationComplete?: (event: AnimationEffectEvent) => void;
		onAnimationDestroy?: (event: AnimationEffectEvent) => void;
	},
) {
	const { drawerId, onAnimationBegin, onAnimationComplete, onAnimationDestroy } = options;
	const animationNodes = animationParts.map((animationPart) => animationPart[0]);

	const animationRef = useRef<Animation | null>(null);

	const createAnimation = useCallback(() => {
		if (!animationTemplate) {
			return null;
		}

		const animations = animationParts.map(([node, nodeConfig]) => {
			if (!node) {
				return null;
			}

			return new TweenAnimation(
				{
					...nodeConfig,
					node,
				},
				animationTemplate.options,
				animationTemplate.id,
			);
		});

		if (animations.some((a) => a == null)) {
			return null;
		}

		return animations.length === 1
			? animations[0]
			: new AnimationGroup(animations as Animation[], animationTemplate.id);
	}, [...animationNodes, animationTemplate?.id]);

	useEffect(() => {
		// Each setup owns its wrapper, including StrictMode's setup → cleanup → setup probe.
		// Reusing a memoized wrapper here would try to play an already destroyed animation.
		const animation = createAnimation();
		animationRef.current = animation;
		if (!animation || !animationTemplate) {
			return;
		}

		const event = {
			animationId: animation.id,
			animationGroupId: animationTemplate.groupId,
			animationKey: animationTemplate.key,
			drawerId,
		};
		animation.onAnimationBegin = () => onAnimationBegin?.(event);
		animation.onAnimationComplete = () => onAnimationComplete?.(event);
		animation.onAnimationDestroy = () => onAnimationDestroy?.(event);

		return () => {
			// Cleanup must not advance the simulation queue or report a late completion.
			animation.onAnimationBegin = null;
			animation.onAnimationComplete = null;
			animation.onAnimationDestroy = null;
			animation.destroy();
			animationRef.current = null;
		};
	}, [createAnimation]);

	useEffect(() => {
		const animation = animationRef.current;
		if (!animation || !animationTemplate) {
			return;
		}

		async function runAnimation() {
			try {
				if (animationTemplate?.dispose) {
					if (animationTemplate.options?.autoReverse) {
						await animation?.reverse();
					} else {
						await animation?.reset();
					}
					animation?.destroy();
				} else {
					await animation?.play();
				}
			} catch {
				// Cleanup can cancel playback or disposal while it is awaiting a tween event.
			}
		}

		runAnimation();
	}, [createAnimation, animationTemplate?.dispose]);
}
