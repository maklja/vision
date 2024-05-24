import Konva from 'konva';

export function changeCursorStyle(cursorStyle: string, stage?: Konva.Stage | null) {
	if (!stage) {
		return;
	}

	stage.container().style.cursor = cursorStyle;
}

