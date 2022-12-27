import Konva from 'konva';
import { useEffect, useMemo } from 'react';
import { Animation, AnimationOptions } from '../Animation';
import { AnimationGroup } from '../AnimationGroup';
import { TweenAnimation, TweenAnimationInstanceConfig } from '../tween';

export interface AnimationGroupFactory {
	node: Konva.Node | null;
	mapper: (animation: TweenAnimationInstanceConfig) => {
		config?: Konva.NodeConfig;
		options?: AnimationOptions;
	};
}

export const useAnimationGroups = (
	animationConfig: TweenAnimationInstanceConfig | undefined | null,
	animationFactories: AnimationGroupFactory[],
): Animation | null => {
	const animations = animationFactories.map(({ node, mapper }) =>
		useMemo(() => {
			if (!node || !animationConfig) {
				return null;
			}

			const { config, options } = mapper(animationConfig);
			return new TweenAnimation(
				{
					...config,
					node,
				},
				options,
				animationConfig?.id,
			);
		}, [node, animationConfig?.id]),
	);

	const animation = useMemo(() => {
		if (animations.some((animation) => animation == null)) {
			return null;
		}

		return new AnimationGroup(animations as Animation[], animationConfig?.id);
	}, [...animations, animationConfig?.id]);

	useEffect(() => {
		if (!animationConfig) {
			return;
		}

		animationConfig.dispose ? animation?.destroy() : animation?.play();
	}, [animationConfig?.dispose]);

	return animation;
};
