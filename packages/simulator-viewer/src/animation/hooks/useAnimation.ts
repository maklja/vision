import Konva from 'konva';
import { useEffect, useMemo } from 'react';
import { TweenAnimation } from '../tween';
import { DrawerAnimationTemplate } from '../AnimationTemplate';
import { useAnimationEffect } from './useAnimationEffect';
import { AnimationEffectEvent } from './AnimationEffectEvent';

export const useAnimation = (
	node: Konva.Node | null,
	options: {
		drawerId: string;
		animationTemplate: DrawerAnimationTemplate | undefined | null;
		mapper: (animation: DrawerAnimationTemplate) => {
			config?: Konva.NodeConfig;
		};
		onAnimationBegin?: (event: AnimationEffectEvent) => void;
		onAnimationComplete?: (event: AnimationEffectEvent) => void;
		onAnimationDestroy?: (event: AnimationEffectEvent) => void;
	},
) => {
	const {
		drawerId,
		animationTemplate,
		mapper,
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
	} = options;
	const animation = useMemo(() => {
		if (!node || !animationTemplate) {
			return null;
		}

		const { config } = mapper(animationTemplate);
		return new TweenAnimation(
			{
				...config,
				node,
			},
			animationTemplate.options,
			animationTemplate?.id,
		);
	}, [node, animationTemplate?.id]);

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

