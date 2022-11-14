import { useMemo } from 'react';
import { Group } from 'react-konva';
import { ConnectPointsDrawerEvent, DrawerEvent, DrawerEvents } from '../../drawers';
import { addDrawerSettings, removeDrawerSettings } from '../../store/drawersSlice';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store/rootState';
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
	useThemeContext,
} from '../../store/stageSlice';
import { createElementDrawer } from './createElementDrawer';
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
		const { connectPoint, id, element } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;
		dispatch(linkConnectLineDraw({ targetId: id, targetPoint: element.center }));
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

const drawerSelectStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
	onMouseDown: (e: DrawerEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}
		dispatch(selectElements([e.id]));
	},
	onMouseOver: (e: DrawerEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('pointer', originalEvent);
			dispatch(highlightElements([id]));
		}
	},
	onMouseOut: (e: DrawerEvent) => {
		const { originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('default', originalEvent);
			dispatch(highlightElements([]));
		}
	},
	onDragStart: (e: DrawerEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}
		dispatch(changeState(StageState.Dragging));
	},
	onDragEnd: (e: DrawerEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}
		dispatch(changeState(StageState.Select));
	},
	onDragMove: (e: DrawerEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			const position = originalEvent.currentTarget.getAbsolutePosition();
			dispatch(
				moveDrawer({
					id,
					x: position.x,
					y: position.y,
				}),
			);
		}
	},
});

const drawerDragStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
	onDragEnd: (e: DrawerEvent) => {
		const { originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			dispatch(changeState(StageState.Select));
		}
	},
	onDragMove: (e: DrawerEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			const position = originalEvent.currentTarget.getAbsolutePosition();
			dispatch(
				moveDrawer({
					id,
					x: position.x,
					y: position.y,
				}),
			);
		}
	},
});

export const DrawerLayer = () => {
	const themeContext = useThemeContext();
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

	const handleDrawerAnimationReady = (drawerEvent: DrawerEvent) => {
		appDispatch(
			addDrawerSettings({
				id: drawerEvent.id,
				animations: drawerEvent.animations ?? null,
			}),
		);
	};

	const handleDrawerAnimationDestroy = (drawerEvent: DrawerEvent) => {
		appDispatch(removeDrawerSettings(drawerEvent.id));
	};

	return (
		<Group>
			{elements
				.map((el) => {
					const highlightedConnectPoints = useAppSelector(
						selectHighlightedConnectPointsByElementId(el.id),
					).map((cp) => cp.type);
					const select = useAppSelector(isSelectedElement(el.id));
					const highlight = useAppSelector(isHighlightedElement(el.id));
					const notDragging = stageState !== StageState.Dragging;

					return (
						<Group key={el.id}>
							{createElementDrawer(el, {
								...el,
								...elementHandlers,
								theme: themeContext,
								highlight,
								select,
								visibleConnectionPoints: select && notDragging,
								highlightedConnectPoints: highlightedConnectPoints,
								onConnectPointMouseDown: connectPointHandlers.onMouseDown,
								onConnectPointMouseUp: connectPointHandlers.onMouseUp,
								onConnectPointMouseOut: connectPointHandlers.onMouseOut,
								onConnectPointMouseOver: connectPointHandlers.onMouseOver,
								onAnimationReady: handleDrawerAnimationReady,
								onAnimationDestroy: handleDrawerAnimationDestroy,
							})}
						</Group>
					);
				})
				.filter((drawer) => drawer != null)}
		</Group>
	);
};

