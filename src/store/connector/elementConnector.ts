import Konva from 'konva';
import { connect } from 'react-redux';
import { ElementState } from '../../elements';
import { highlightDrawers, removeHighlightDrawers, selectDrawers, moveDrawer } from '../stageSlice';
import { AppDispatch, RootState } from '../rootState';

export interface ElementProps {
	id: string;
	x?: number;
	y?: number;
	size?: number;
	state?: ElementState;
	onMouseDown?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseDrag?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

const mapState = (state: RootState, props: ElementProps): ElementProps => {
	const drawer = state.stage.drawers.find((drawer) => drawer.id === props.id) || {};
	const selected = state.stage.selected.some((drawerId) => drawerId === props.id);
	const highlighted = state.stage.highlighted.some((drawerId) => drawerId === props.id);

	let elementState: ElementState | undefined;

	if (selected) {
		elementState = ElementState.Selected;
	} else if (highlighted) {
		elementState = ElementState.Highlight;
	}

	return {
		...props,
		...drawer,
		state: elementState,
	};
};

const mapDispatch = (dispatch: AppDispatch) => ({
	onMouseDown: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(selectDrawers([id]));
	},
	onMouseOver: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(highlightDrawers([id]));
	},
	onMouseOut: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(removeHighlightDrawers([id]));
	},
	onMouseDrag: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
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

