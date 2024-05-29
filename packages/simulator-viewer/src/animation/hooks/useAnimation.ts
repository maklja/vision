import Konva from 'konva';
import { useEffect, useMemo } from 'react';
import { TweenAnimation } from '../tween';
import { DrawerAnimationTemplate } from '../AnimationTemplate';
import { useAnimationEffect } from './useAnimationEffect';
import { AnimationEffectEvent } from './AnimationEffectEvent';
import { AnimationGroup } from '../AnimationGroup';
import { Animation } from '../Animation';

async function disposeAnimation(
	animationTemplate: DrawerAnimationTemplate | undefined | null,
	animation: TweenAnimation | Animation | null,
) {
	try {
		if (animationTemplate?.options?.autoReverse) {
			await animation?.reverse();
		} else {
			await animation?.reset();
		}
		animation?.destroy();
	} catch {
		// no need to handle this error if animation dispose fails
	}
}

async function startAnimation(animation: TweenAnimation | Animation | null) {
	try {
		await animation?.play();
	} catch {
		// no need to handle this error if animation play fails
	}
}

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

	const animation = useMemo(() => {
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

	useAnimationEffect(animation, {
		onAnimationBegin: (animation) => {
			if (!animationTemplate) {
				return;
			}

			onAnimationBegin?.({
				animationId: animation.id,
				animationGroupId: animationTemplate.groupId,
				animationKey: animationTemplate.key,
				drawerId,
			});
		},
		onAnimationComplete: (animation) => {
			if (!animationTemplate) {
				return;
			}

			onAnimationComplete?.({
				animationId: animation.id,
				animationGroupId: animationTemplate.groupId,
				animationKey: animationTemplate.key,
				drawerId,
			});
		},
		onAnimationDestroy: (animation) => {
			if (!animationTemplate) {
				return;
			}

			onAnimationDestroy?.({
				animationId: animation.id,
				animationGroupId: animationTemplate.groupId,
				animationKey: animationTemplate.key,
				drawerId,
			});
		},
	});

	useEffect(() => {
		if (!animationTemplate) {
			return;
		}

		if (animationTemplate.dispose) {
			disposeAnimation(animationTemplate, animation);
		} else {
			startAnimation(animation);
		}
	}, [animationTemplate?.id, animationTemplate?.dispose]);

useEffect(() => {
		return () => animation?.destroy();
	}, [animation]);

	return animation;
}

