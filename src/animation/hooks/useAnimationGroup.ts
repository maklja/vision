import Konva from 'konva';
import { useEffect, useMemo } from 'react';
import { Animation } from '../Animation';
import { AnimationGroup } from '../AnimationGroup';
import { TweenAnimation } from '../tween';
import { DrawerAnimationTemplate } from '../AnimationTemplate';

export interface AnimationGroupFactory {
	node: Konva.Node | null;
	mapper: (animation: DrawerAnimationTemplate) => {
		config?: Konva.NodeConfig;
	};
}

export const useAnimationGroups = (
	animationTemplate: DrawerAnimationTemplate | undefined | null,
	animationFactories: AnimationGroupFactory[],
): Animation | null => {
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

	useEffect(() => {
		if (!animationTemplate) {
			return;
		}

		animationTemplate.dispose ? animation?.destroy() : animation?.play();
	}, [animationTemplate?.dispose]);

	return animation;
};
