import Konva from 'konva';
import { connect } from 'react-redux';
import { ElementProps } from '../../elements';
import {
	StageState,
	highlightDrawers,
	removeHighlightDrawers,
	selectDrawers,
	moveDrawer,
	changeState,
} from '../stageSlice';
import { AppDispatch, RootState } from '../rootState';

const mapState = (state: RootState, props: ElementProps): ElementProps => {
	const drawer = state.stage.drawers.find((drawer) => drawer.id === props.id) || {};
	const selected = state.stage.selected.some((drawerId) => drawerId === props.id);
	const highlighted = state.stage.highlighted.some((drawerId) => drawerId === props.id);
	const dragging = state.stage.state === StageState.Dragging;

	return {
		...props,
		...drawer,
		selected,
		highlighted,
		dragging,
	};
};

const changeCursorStyle = (cursorStyle: string, e: Konva.KonvaEventObject<MouseEvent>) => {
	const stage = e.currentTarget.getStage();
	if (!stage) {
		return;
	}

	stage.container().style.cursor = cursorStyle;
};

const mapDispatch = (dispatch: AppDispatch) => ({
	onMouseDown: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(selectDrawers([id]));
	},
	onMouseOver: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		changeCursorStyle('pointer', e);
		dispatch(highlightDrawers([id]));
	},
	onMouseOut: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		changeCursorStyle('default', e);
		dispatch(removeHighlightDrawers([id]));
	},
	onDragStart: (_: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(changeState(StageState.Dragging));
	},
	onDragEnd: (_: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(changeState(StageState.Select));
	},
	onDragMove: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const position = e.currentTarget.getAbsolutePosition();
		dispatch(
			moveDrawer({
				id,
				x: position.x,
				y: position.y,
			}),
		);
	},
});

export const elementConnector = connect(mapState, mapDispatch);

