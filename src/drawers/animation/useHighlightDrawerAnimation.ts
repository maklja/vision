import Konva from 'konva';
import { useAnimation, useAnimationGroups } from '../../animation';
import { highlightDrawerAnimation } from './highlightDrawerAnimation';
import { highlightDrawerTextAnimation } from './highlightDrawerTextAnimation';

export const useHighlightDrawerAnimation = (
	mainShape: Konva.Node | null,
	textShape: Konva.Text | null,
) => {
	const mainShapeAnimation = useAnimation(mainShape, highlightDrawerAnimation);
	const textShapeAnimation = useAnimation(textShape, highlightDrawerTextAnimation);

	return useAnimationGroups(mainShapeAnimation, textShapeAnimation);
};

