import Konva from 'konva';
import { DependencyList, useEffect, useMemo } from 'react';
import { ThemeContext } from '../../theme';
import { Animation } from '../Animation';

export interface AnimationsDefinition {
	[k: string]: [Konva.Node | null, (node: Konva.Node, theme: ThemeContext) => Animation];
}

export const useAnimation = (
	node: Konva.Node | null,
	animationFactory: (node: Konva.Node) => Animation | null,
	dependencies: DependencyList = [],
) => {
	const animation = useMemo(
		() => (!node ? null : animationFactory(node)),
		[node, ...dependencies],
	);

	useEffect(() => {
		return () => {
			animation?.destroy();
		};
	}, [animation]);

	return animation;
};

