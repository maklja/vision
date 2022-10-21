import Konva from 'konva';
import { connect } from 'react-redux';
import { ConnectPointsProps, ConnectionPointsEvent } from '../../drawers';
import { AppDispatch, RootState } from '../rootState';
import {
	startConnectLineDraw,
	pinConnectLine,
	unpinConnectLine,
	linkConnectLineDraw,
} from '../stageSlice';

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
				sourceId: cEvent.id,
				targetId: null,
				points: [
					{ x: cEvent.element.x, y: cEvent.element.y },
					{ x: cEvent.connector.x, y: cEvent.connector.y },
					{ x: cEvent.connector.x, y: cEvent.connector.y },
				],
				locked: false,
			}),
		);
	},
	onMouseUp: (cEvent: ConnectionPointsEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(linkConnectLineDraw({ targetId: cEvent.id }));
	},
	onMouseOver: (cEvent: ConnectionPointsEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(
			pinConnectLine({
				drawerId: cEvent.id,
				position: {
					x: cEvent.connector.x,
					y: cEvent.connector.y,
				},
			}),
		);
	},
	onMouseOut: (_: ConnectionPointsEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(unpinConnectLine());
	},
});

export const connectPointsConnector = connect(mapState, mapDispatch);

