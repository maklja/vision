import Konva from 'konva';
import { useEffect, useMemo } from 'react';
import { AnimationOptions } from '../Animation';
import { TweenAnimation, TweenAnimationInstanceConfig } from '../tween';

export const useAnimation = (
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
			animationConfig?.id,
		);
	}, [node, animationConfig?.id]);

	const disposeAnimation = async () => {
		try {
			await animation?.reverse();
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
		if (!animationConfig) {
			return;
		}

		if (animationConfig.dispose) {
			disposeAnimation();
		} else {
			startAnimation();
		}
	}, [animationConfig?.dispose]);

	useEffect(() => {
		return () => animation?.destroy();
	}, [animation]);

	return animation;
};
