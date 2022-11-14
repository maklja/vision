import Konva from 'konva';
import { useAnimation, useAnimationGroups } from '../../animation';
import { ThemeContext } from '../../theme';
import { highlightDrawerAnimation } from './highlightDrawerAnimation';
import { highlightDrawerTextAnimation } from './highlightDrawerTextAnimation';

export const useHighlightDrawerAnimation = (
	mainShape: Konva.Node | null,
	textShape: Konva.Text | null,
	theme: ThemeContext,
) => {
	const mainShapeAnimation = useAnimation(
		mainShape,
		(node) => highlightDrawerAnimation(node, theme),
		[theme],
	);
	const textShapeAnimation = useAnimation(
		textShape,
		(node) => highlightDrawerTextAnimation(node, theme),
		[theme],
	);

	return useAnimationGroups(mainShapeAnimation, textShapeAnimation);
};

