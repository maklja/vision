import Konva from 'konva';
import { useAnimation, useAnimationGroups } from '../../animation';
import { ThemeContext } from '../../theme';
import { errorDrawerAnimation } from './errorDrawerAnimation';
import { errorDrawerTextAnimation } from './errorDrawerTextAnimation';

export const useErrorDrawerAnimation = (
	mainShape: Konva.Node | null,
	textShape: Konva.Text | null,
	theme: ThemeContext,
) => {
	const mainShapeAnimation = useAnimation(
		mainShape,
		(node) => errorDrawerAnimation(node, theme),
		[theme],
	);
	const textShapeAnimation = useAnimation(
		textShape,
		(node) => errorDrawerTextAnimation(node, theme),
		[theme],
	);

	return useAnimationGroups(mainShapeAnimation, textShapeAnimation);
};

