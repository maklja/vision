import Konva from 'konva';
import { connect } from 'react-redux';
import { ElementState } from '../../elements';
import { highlightDrawers, removeHighlightDrawers, selectDrawers, moveDrawer } from '../stageSlice';
import { AppDispatch, RootState } from '../rootState';
import { ConnectionPoint } from '../../model';

export interface ElementProps {
	id: string;
	x?: number;
	y?: number;
	size?: number;
	state?: ElementState;
	connectedPoints?: ConnectionPoint[];
	onMouseDown?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseDrag?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

const mapState = (state: RootState, props: ElementProps): ElementProps => {
	const drawer = state.stage.drawers.find((drawer) => drawer.id === props.id) || {};
	const connectedPoints = state.stage.connectLines.reduce((cPoints, cl) => {
		if (cl.source.id === props.id) {
			return cPoints.add(cl.source.point);
		}

		if (cl.target.id === props.id) {
			return cPoints.add(cl.target.point);
		}

		return cPoints;
	}, new Set<ConnectionPoint>());
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
		connectedPoints: Array.from(connectedPoints),
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

