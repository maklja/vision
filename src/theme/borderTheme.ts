import Konva from 'konva';
import { ElementState } from '../elements';

export const selectedBorderTheme: Konva.RectConfig = {
	stroke: 'blue',
	strokeWidth: 1.5,
	cornerRadius: 8,
};

export const highlightBorderTheme: Konva.RectConfig = {
	stroke: 'skyblue',
	strokeWidth: 1,
	cornerRadius: 8,
};

export const borderThemeByElementState = (state: ElementState): Konva.RectConfig => {
	if (state === ElementState.Selected) {
		return selectedBorderTheme;
	}

	if (state === ElementState.Highlight) {
		return highlightBorderTheme;
	}

	return {};
};
