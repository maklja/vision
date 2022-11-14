import Konva from 'konva';
import { DependencyList, useEffect, useMemo } from 'react';
import { useDrawerTheme } from '../store/stageSlice';
import { DrawerTheme } from '../theme';
import { Animation } from './Animation';

export interface AnimationsDefinition {
	[k: string]: [Konva.Node | null, (node: Konva.Node) => Animation];
}

export const useAnimation = (
	node: Konva.Node | null,
	animationFactory: (node: Konva.Node, theme: DrawerTheme) => Animation | null,
	dependencies: DependencyList = [],
) => {
	const theme = useDrawerTheme();
	const animation = useMemo(
		() => (!node ? null : animationFactory(node, theme)),
		[node, ...dependencies],
	);

	useEffect(() => {
		return () => {
			animation?.destroy();
		};
	}, [animation]);

	return animation;
};
