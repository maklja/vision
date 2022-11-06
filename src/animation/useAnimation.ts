import Konva from 'konva';
import { useEffect, useMemo } from 'react';
import { Animation } from './Animation';

export interface AnimationsDefinition {
	[k: string]: [Konva.Node | null, (node: Konva.Node) => Animation];
}

export const useAnimation = (
	node: Konva.Node | null,
	animationFactory: (node: Konva.Node) => Animation,
) => {
	const animation = useMemo(() => {
		if (!node) {
			return null;
		}

		return animationFactory(node);
	}, [node, animationFactory]);

	useEffect(() => {
		return () => animation?.destroy();
	}, [animation]);

	return animation;
};
