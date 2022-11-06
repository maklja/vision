import Konva from 'konva';

export const changeCursorStyle = (cursorStyle: string, e: Konva.KonvaEventObject<MouseEvent>) => {
	const stage = e.currentTarget.getStage();
	if (!stage) {
		return;
	}

	stage.container().style.cursor = cursorStyle;
};
