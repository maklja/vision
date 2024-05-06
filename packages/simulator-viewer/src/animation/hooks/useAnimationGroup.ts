import Konva from 'konva';
import { useEffect, useMemo } from 'react';
import { Animation } from '../Animation';
import { AnimationGroup } from '../AnimationGroup';
import { TweenAnimation } from '../tween';
import { DrawerAnimationTemplate } from '../AnimationTemplate';
import { useAnimationEffect } from './useAnimationEffect';
import { AnimationEffectEvent } from './AnimationEffectEvent';

export interface AnimationGroupFactory {
	node: Konva.Node | null;
	mapper: (animation: DrawerAnimationTemplate) => {
		config?: Konva.NodeConfig;
	};
}

export const useAnimationGroups = (
	animationTemplate: DrawerAnimationTemplate | undefined | null,
	options: {
		drawerId: string;
		animationFactories: AnimationGroupFactory[];
		onAnimationBegin?: (event: AnimationEffectEvent) => void;
		onAnimationComplete?: (event: AnimationEffectEvent) => void;
		onAnimationDestroy?: (event: AnimationEffectEvent) => void;
	},
): Animation | null => {
	const {
		animationFactories,
		drawerId,
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
	} = options;
	const animations = animationFactories.map(({ node, mapper }) =>
		useMemo(() => {
			if (!node || !animationTemplate) {
				return null;
			}

			const { config } = mapper(animationTemplate);
			return new TweenAnimation(
				{
					...config,
					node,
				},
				animationTemplate?.options,
				animationTemplate?.id,
			);
		}, [node, animationTemplate?.id]),
	);

	const animation = useMemo(() => {
		if (animations.some((animation) => animation == null)) {
			return null;
		}

		return new AnimationGroup(animations as Animation[], animationTemplate?.id);
	}, [...animations, animationTemplate?.id]);

	useAnimationEffect(animation, {
		onAnimationBegin: (animation) => {
			if (!animationTemplate) {
				return;
			}

			onAnimationBegin?.({
				animationId: animation.id,
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
				animationKey: animationTemplate.key,
				drawerId,
			});
		},
	});

	const disposeAnimation = async () => {
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
	};

	const startAnimation = async () => {
		try {
			await animation?.play();
		} catch {
			// no need to handle this error if animation play fails
		}
	};

	useEffect(() => {
		if (!animationTemplate) {
			return;
		}

		if (animationTemplate.dispose) {
			disposeAnimation();
		} else {
			startAnimation();
		}
	}, [animationTemplate?.dispose]);

	useEffect(() => {
		return () => animation?.destroy();
	}, [animation]);

	return animation;
};