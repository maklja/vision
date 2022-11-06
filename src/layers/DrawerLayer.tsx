import Konva from 'konva';
import { useMemo } from 'react';
import { Group } from 'react-konva';
import { ConnectPointsDrawerEvent } from '../drawers';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store/rootState';
import {
	changeState,
	highlightConnectPoints,
	highlightElements,
	isHighlightedElement,
	isSelectedElement,
	linkConnectLineDraw,
	moveDrawer,
	pinConnectLine,
	selectElements,
	selectHighlightedConnectPointsByElementId,
	selectStageElements,
	selectStageState,
	StageState,
	startConnectLineDraw,
	unpinConnectLine,
} from '../store/stageSlice';
import { createElementDrawer } from './createElementDrawer';
import { DrawerWrapper } from './DrawerWrapper';
import { changeCursorStyle } from './utils';

const connectPointSelectStateHandlers = (dispatch: AppDispatch) => ({
	onMouseDown: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, element, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;

		dispatch(
			startConnectLineDraw({
				sourceId: id,
				points: [
					{ ...element.center },
					{ x: connectPoint.x, y: connectPoint.y },
					{ x: connectPoint.x, y: connectPoint.y },
				],
			}),
		);
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;

		dispatch(
			highlightConnectPoints([
				{
					elementId: id,
					type: connectPoint.type,
				},
			]),
		);
	},
	onMouseOut: (cEvent: ConnectPointsDrawerEvent) => {
		cEvent.connectPoint.originalEvent.cancelBubble = true;
		dispatch(highlightConnectPoints([]));
	},
});

const connectPointDrawConnectLineHandlers = (dispatch: AppDispatch) => ({
	onMouseUp: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;
		dispatch(linkConnectLineDraw({ targetId: id }));
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;
		connectPoint.animations?.snapConnectPoint.play();
		dispatch(
			pinConnectLine({
				elementId: id,
				position: {
					x: connectPoint.x,
					y: connectPoint.y,
				},
			}),
		);
	},
	onMouseOut: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;
		connectPoint.animations?.snapConnectPoint.reset();
		dispatch(unpinConnectLine());
	},
});

const drawerSelectStateHandlers = (dispatch: AppDispatch) => ({
	onMouseDown: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(selectElements([id]));
	},
	onMouseOver: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		changeCursorStyle('pointer', e);
		dispatch(highlightElements([id]));
	},
	onMouseOut: (_: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		changeCursorStyle('default', e);
		dispatch(highlightElements([]));
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

const drawerDragStateHandlers = (dispatch: AppDispatch) => ({
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

export const DrawerLayer = () => {
	const elements = useAppSelector(selectStageElements);
	const stageState = useAppSelector(selectStageState);
	const appDispatch = useAppDispatch();

	const elementHandlers = useMemo(() => {
		if (stageState === StageState.Select) {
			return drawerSelectStateHandlers(appDispatch);
		}

		if (stageState === StageState.Dragging) {
			return drawerDragStateHandlers(appDispatch);
		}

		return {};
	}, [stageState]);

	const connectPointHandlers: {
		onMouseDown?: (cEvent: ConnectPointsDrawerEvent) => void;
		onMouseUp?: (cEvent: ConnectPointsDrawerEvent) => void;
		onMouseOver?: (cEvent: ConnectPointsDrawerEvent) => void;
		onMouseOut?: (cEvent: ConnectPointsDrawerEvent) => void;
	} = useMemo(() => {
		if (stageState === StageState.Select) {
			return connectPointSelectStateHandlers(appDispatch);
		}

		if (stageState === StageState.DrawConnectLine) {
			return connectPointDrawConnectLineHandlers(appDispatch);
		}

		return {};
	}, [stageState]);

	return (
		<Group>
			{elements
				.map((el) => {
					const highlightedConnectPoints = useAppSelector(
						selectHighlightedConnectPointsByElementId(el.id),
					).map((cp) => cp.type);
					const selected = useAppSelector(isSelectedElement(el.id));
					const highlighted = useAppSelector(isHighlightedElement(el.id));
					const notDragging = stageState !== StageState.Dragging;

					return (
						<DrawerWrapper
							{...el}
							key={el.id}
							highlighted={highlighted}
							selected={selected}
							visibleConnectionPoints={selected && notDragging}
							highlightedConnectPoints={highlightedConnectPoints}
							onConnectPointMouseDown={connectPointHandlers.onMouseDown}
							onConnectPointMouseUp={connectPointHandlers.onMouseUp}
							onConnectPointMouseOut={connectPointHandlers.onMouseOut}
							onConnectPointMouseOver={connectPointHandlers.onMouseOver}
						>
							{createElementDrawer(el, { ...el, ...elementHandlers })}
						</DrawerWrapper>
					);
				})
				.filter((drawer) => drawer != null)}
		</Group>
	);
};
