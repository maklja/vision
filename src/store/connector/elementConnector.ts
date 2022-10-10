import Konva from 'konva';
import { connect } from 'react-redux';
import { ElementState } from '../../elements';
import {
	highlightDrawers,
	removeHighlightDrawers,
	selectDrawers,
	moveDrawer,
} from '../drawersSlice';
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

const mapState = (state: RootState, props: ElementProps) => {
	const drawer = state.drawers.active.find((drawer) => drawer.id === props.id) || {};
	const selected = state.drawers.selected.some((drawerId) => drawerId === props.id);
	const highlighted = state.drawers.highlighted.some((drawerId) => drawerId === props.id);

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
		dispatch(
			moveDrawer({
				id,
				dx: e.currentTarget.x(),
				dy: e.currentTarget.y(),
			}),
		);
	},
});

export const elementConnector = connect(mapState, mapDispatch);

