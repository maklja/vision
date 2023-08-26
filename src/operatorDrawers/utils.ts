import Konva from 'konva';

export const changeCursorStyle = (cursorStyle: string, stage?: Konva.Stage | null) => {
	if (!stage) {
		return;
	}

	stage.container().style.cursor = cursorStyle;
};
