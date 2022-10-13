import Konva from 'konva';
import { connect } from 'react-redux';
import { ConnectPointsProps, ConnectionPointsEvent } from '../../elements';
import { AppDispatch, RootState } from '../rootState';
import { startConnectLineDraw } from '../stageSlice';

const mapState = (_: RootState, props: ConnectPointsProps): ConnectPointsProps => {
	return {
		...props,
	};
};

const mapDispatch = (dispatch: AppDispatch) => ({
	onMouseDown: (cEvent: ConnectionPointsEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(
			startConnectLineDraw({
				id: 'lol',
				sourceId: cEvent.id,
				targetId: null,
				points: [
					{ x: cEvent.element.x, y: cEvent.element.y },
					{ x: cEvent.connector.x, y: cEvent.connector.y },
					{ x: cEvent.connector.x, y: cEvent.connector.y },
				],
			}),
		);
	},
});

export const connectPointsConnector = connect(mapState, mapDispatch);

