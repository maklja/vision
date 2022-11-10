import Konva from 'konva';
import { DependencyList, useEffect, useMemo } from 'react';
import { Animation } from './Animation';

export interface AnimationsDefinition {
	[k: string]: [Konva.Node | null, (node: Konva.Node) => Animation];
}

export const useAnimation = (
	node: Konva.Node | null,
	animationFactory: (node: Konva.Node) => Animation | null,
	dependencies: DependencyList = [],
) => {
	const animation = useMemo(() => {
		if (!node) {
			return null;
		}

		return animationFactory(node);
	}, [node, ...dependencies]);

	useEffect(() => {
		return () => {
			animation?.destroy();
		};
	}, [animation]);

	return animation;
};
