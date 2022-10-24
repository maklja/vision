import Konva from 'konva';
import { connect } from 'react-redux';
import { ConnectPointsDrawer, ElementProps } from '../../drawers';
import {
	StageState,
	highlightDrawers,
	removeHighlightDrawers,
	selectDrawers,
	moveDrawer,
	changeState,
} from '../stageSlice';
import { AppDispatch, RootState } from '../rootState';
// import { connectPointsConnector } from './connectPointsConnector';

// const ConnectedConnectPointsDrawer = connectPointsConnector(ConnectPointsDrawer);

const mapState = (state: RootState, props: ElementProps): ElementProps => {
	const drawer = state.stage.drawers.find((drawer) => drawer.id === props.id);
	const selected = state.stage.selected.some((drawerId) => drawerId === props.id);
	const highlighted = state.stage.highlighted.some((drawerId) => drawerId === props.id);
	const dragging = state.stage.state === StageState.Dragging;

	return {
		...props,
		...drawer,
		// selected,
		// highlighted,
		// dragging,
		// onCreateConnectPoints: (connectPointProps) => {
		// 	if (!selected || dragging) {
		// 		return null;
		// 	}

		// 	return (
		// 		<ConnectedConnectPointsDrawer
		// 			{...connectPointProps}
		// 			selected={true}
		// 			absoluteX={drawer?.x ?? 0}
		// 			absoluteY={drawer?.y ?? 0}
		// 		/>
		// 	);
		// },
	};
};

const changeCursorStyle = (cursorStyle: string, e: Konva.KonvaEventObject<MouseEvent>) => {
	const stage = e.currentTarget.getStage();
	if (!stage) {
		return;
	}

	stage.container().style.cursor = cursorStyle;
};

export const drawerMapDispatch = (dispatch: AppDispatch) => ({
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

export const elementConnector = connect(mapState, drawerMapDispatch);
