import Konva from 'konva';
import { connect } from 'react-redux';
import { Element } from '../../model';
import { ConnectPointDrawerProps, ConnectPointsDrawerEvent } from '../../drawers';
import { AppDispatch, RootState } from '../rootState';
import {
	startConnectLineDraw,
	pinConnectLine,
	unpinConnectLine,
	linkConnectLineDraw,
} from '../stageSlice';

const mapState = (_: RootState, props: ConnectPointDrawerProps): ConnectPointDrawerProps => props;

export const connectPointsMapDispatch = (dispatch: AppDispatch, el: Element) => ({
	onMouseDown: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(
			startConnectLineDraw({
				sourceId: cEvent.id,
				targetId: null,
				points: [
					{ x: el.x, y: el.y },
					{ x: cEvent.connectPoint.x, y: cEvent.connectPoint.y },
					{ x: cEvent.connectPoint.x, y: cEvent.connectPoint.y },
				],
				locked: false,
			}),
		);
	},
	onMouseUp: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(linkConnectLineDraw({ targetId: cEvent.id }));
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(
			pinConnectLine({
				drawerId: cEvent.id,
				position: {
					x: cEvent.connectPoint.x,
					y: cEvent.connectPoint.y,
				},
			}),
		);
	},
	onMouseOut: (_: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(unpinConnectLine());
	},
});

export const mapDispatch = (dispatch: AppDispatch) => ({
	onMouseDown: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(
			startConnectLineDraw({
				sourceId: cEvent.id,
				targetId: null,
				points: [
					{ x: 0, y: 0 },
					{ x: cEvent.connectPoint.x, y: cEvent.connectPoint.y },
					{ x: cEvent.connectPoint.x, y: cEvent.connectPoint.y },
				],
				locked: false,
			}),
		);
	},
	onMouseUp: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(linkConnectLineDraw({ targetId: cEvent.id }));
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(
			pinConnectLine({
				drawerId: cEvent.id,
				position: {
					x: cEvent.connectPoint.x,
					y: cEvent.connectPoint.y,
				},
			}),
		);
	},
	onMouseOut: (_: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(unpinConnectLine());
	},
});

export const connectPointsConnector = connect(mapState, mapDispatch);
