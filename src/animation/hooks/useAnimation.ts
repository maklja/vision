import Konva from 'konva';
import { useEffect, useMemo } from 'react';
import { TweenAnimation } from '../tween';
import { DrawerAnimationTemplate } from '../AnimationTemplate';

export const useAnimation = (
	node: Konva.Node | null,
	animationTemplate: DrawerAnimationTemplate | undefined | null,
	mapper: (animation: DrawerAnimationTemplate) => {
		config?: Konva.NodeConfig;
	},
) => {
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
