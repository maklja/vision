import { connect } from 'react-redux';
import { ElementState } from '../../elements';
import { highlightDrawers, removeHighlightDrawers, selectDrawers } from '../drawersSlice';
import { AppDispatch, RootState } from '../rootState';

export interface ElementProps {
	id: string;
	x?: number;
	y?: number;
	size?: number;
	state?: ElementState;
	onMouseDown?: (id: string) => void;
	onMouseOver?: (id: string) => void;
	onMouseOut?: (id: string) => void;
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
	onMouseDown: (id: string) => {
		dispatch(selectDrawers([id]));
	},
	onMouseOver: (id: string) => {
		dispatch(highlightDrawers([id]));
	},
	onMouseOut: (id: string) => {
		dispatch(removeHighlightDrawers([id]));
	},
});

export const elementConnector = connect(mapState, mapDispatch);
