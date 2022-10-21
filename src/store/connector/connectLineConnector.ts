import Konva from 'konva';
import { connect } from 'react-redux';
import { ConnectLineElementProps } from '../../drawers';
import {
	StageState,
	highlightDrawers,
	removeHighlightDrawers,
	selectDrawers,
	moveDrawer,
	changeState,
} from '../stageSlice';
import { AppDispatch, RootState } from '../rootState';

const mapState = (state: RootState, props: ConnectLineElementProps): ConnectLineElementProps => {
	const { connectLines, drawers } = state.stage;
	const cl = connectLines.find((cl) => cl.id === props.id);
	if (!cl) {
		return props;
	}

	return props;
};

export const connectLineConnector = connect(mapState);

