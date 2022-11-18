import Konva from 'konva';
import { useEffect, useMemo } from 'react';
import { AnimationOptions } from '../Animation';
import { TweenAnimation, TweenAnimationInstanceConfig } from '../tween';

export const useAnimationNew = (
	node: Konva.Node | null,
	animationConfig: TweenAnimationInstanceConfig | undefined | null,
	mapper: (animation: TweenAnimationInstanceConfig) => {
		config?: Konva.NodeConfig;
		options?: AnimationOptions;
	},
) => {
	const animation = useMemo(() => {
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
		);
	}, [node, animationConfig?.id]);

	useEffect(() => {
		return () => {
			animation?.destroy();
		};
	}, [animation]);

	return animation;
};

