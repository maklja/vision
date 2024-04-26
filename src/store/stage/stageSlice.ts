import { StateCreator } from 'zustand';
import { RootState } from '../rootStore';
import { useShallow } from 'zustand/react/shallow';
import {
	calculateShapeSizeBoundingBox,
	createElementSizesContext,
	createThemeContext,
	ElementSizesContext,
	findElementSize,
	ThemesContext,
} from '../../theme';
import {
	BoundingBox,
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementDescriptor,
	findElementDescriptor,
	IBoundingBox,
	Point,
	SnapLine,
} from '../../model';
import {
	CreateElementPayload,
	moveElementByDelta,
	MoveElementPayload,
	moveElementToPosition,
} from '../elements';
import { LinkConnectLineDrawPayload, moveConnectLinePointsByDelta } from '../connectLines';
import { createSnapLinesByConnectPoint, createSnapLinesByElement } from '../snapLines';
import { AnimationKey } from '../../animation';
import { ObservableEvent, SimulationState } from '../simulation';
import { FlowValueType } from '../../engine';
import { moveConnectPointsByDelta } from '../connectPoints';

export interface StartConnectLineDrawPayload {
	sourceId: string;
	type: ConnectPointType;
	position: ConnectPointPosition;
	points: Point[];
}

export interface MoveByDeltaElementPayload {
	referenceElementId: string;
	x: number;
	y: number;
}

export interface ShowTooltipPayload {
	elementId: string;
	text?: string;
}

export interface ElementTooltip {
	elementId: string;
	text: string | null;
}

export interface PinConnectLinePayload {
	elementId: string;
	connectPointId: string;
	connectPointBoundingBox: IBoundingBox;
}

export interface CreateElementSnapLinesPayload {
	elementId: string;
	x: number;
	y: number;
}

export interface UnpinConnectLinePayload {
	drawerId: string;
	animationId: string | null;
}

export enum StageState {
	Select = 'select',
	LassoSelect = 'lassoSelect',
	DrawConnectLine = 'drawConnectLine',
	Dragging = 'dragging',
	DrawElement = 'drawElement',
}

export enum ZoomType {
	In = 1,
	Out = -1,
}

export interface CanvasState {
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	autoDragInterval: number | null;
	snapToGrip: boolean;
}

const draggableStates = [StageState.Select, StageState.Dragging];

export const isStageStateDragging = (state: StageState) => state === StageState.Dragging;

export const isElementDragAllowed = (state: StageState) => draggableStates.includes(state);

function getConnectPointDescriptor(
	el: Element,
	cpType: ConnectPointType,
	connectLines: ConnectLine[],
) {
	const elDescriptor: ElementDescriptor = findElementDescriptor(el.type, el.properties);

	const elConnectTypeCardinality = connectLines.reduce((cardinality, cl) => {
		if (cl.source.id !== el.id || cl.source.connectPointType !== cpType) {
			return cardinality;
		}

		return cardinality + 1;
	}, 0);

	const cpDescriptor = elDescriptor[cpType] ?? { cardinality: 0, allowedTypes: new Set() };
	return {
		cardinalityExcited: elConnectTypeCardinality >= cpDescriptor.cardinality,
		allowedTypes: cpDescriptor.allowedTypes,
	};
}

export interface StageSlice {
	state: StageState;
	elementSizes: ElementSizesContext;
	lassoSelection: IBoundingBox | null;
	themes: ThemesContext;
	tooltip: ElementTooltip | null;
	highlighted: string[];
	canvasState: CanvasState;
	changeState: (newState: StageState) => void;
	load: (elements: Element[], connectLines: ConnectLine[]) => void;
	startLassoSelection: (startPoint: Point | null) => void;
	stopLassoSelection: () => void;
	updateLassoSelection: (point: Point | null) => void;
	startConnectLineDraw: (payload: StartConnectLineDrawPayload) => void;
	stopConnectPointDraw: () => void;
	addDraftElement: () => void;
	startElementDraw: (payload: CreateElementPayload) => void;
	stopElementDraw: () => void;
	linkConnectLineDraw: (payload: LinkConnectLineDrawPayload) => void;
	moveElement: (payload: MoveElementPayload) => void;
	moveSelectedElementsByDelta: (payload: MoveByDeltaElementPayload) => void;
	createDraftElementSnapLines: (position: Point) => SnapLine[];
	createConnectPointSnapLines: (position: Point) => SnapLine[];
	showTooltip: (payload: ShowTooltipPayload) => void;
	hideTooltip: () => void;
	setHighlighted: (highlightElements: string[]) => void;
	updateCanvasState: (canvasUpdate: Partial<CanvasState>) => void;
	pinConnectLine: (payload: PinConnectLinePayload) => void;
	unpinConnectLine: (payload: UnpinConnectLinePayload) => void;
	removeSimulationAnimation: (animationId: string) => void;
	createElementSnapLines: (payload: CreateElementSnapLinesPayload) => SnapLine[];
	clearCanvasAutoDragInterval: () => void;
}

export const createStageSlice: StateCreator<RootState, [], [], StageSlice> = (set, get) => ({
	state: StageState.Select,
	elementSizes: createElementSizesContext(),
	lassoSelection: null,
	themes: createThemeContext(),
	tooltip: null,
	highlighted: [],
	canvasState: {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		scaleX: 0,
		scaleY: 0,
		autoDragInterval: null,
		snapToGrip: false,
	},
	updateCanvasState: (canvasUpdate: Partial<CanvasState>) =>
		set((state) => {
			state.canvasState = {
				...state.canvasState,
				...canvasUpdate,
			};

			return state;
		}, true),
	clearCanvasAutoDragInterval: () => set((state) => clearCanvasAutoDragInterval(state)),
	setHighlighted: (highlightElements: string[]) =>
		set((state) => {
			state.highlighted = highlightElements;

			return state;
		}, true),
	showTooltip: (payload: ShowTooltipPayload) =>
		set((state) => {
			state.tooltip = {
				elementId: payload.elementId,
				text: payload.text ?? null,
			};

			return state;
		}, true),
	hideTooltip: () =>
		set((state) => {
			if (state.tooltip) {
				state.tooltip = null;
			}

			return state;
		}, true),
	changeState: (newState: StageState) =>
		set((state) => {
			state.state = newState;

			return state;
		}, true),
	load: (elements: Element[], connectLines: ConnectLine[]) => {
		const state = get();
		state.loadElements(elements);
		state.loadConnectPoints(elements);
		state.loadConnectLines(connectLines);
	},
	startConnectLineDraw: (payload: StartConnectLineDrawPayload) => {
		const state = get();
		state.clearAllSelectedElements();

		const el = state.elements[payload.sourceId];
		if (!el) {
			// case when element is not found for some reason
			return;
		}

		state.changeState(StageState.DrawConnectLine);
		state.createConnectLineDraw(payload);

		const connectLines = Object.values(state.connectLines);
		const sourceCpDescriptor = getConnectPointDescriptor(el, payload.type, connectLines);
		// has element excited cardinality
		if (sourceCpDescriptor.cardinalityExcited) {
			return;
		}

		// calculate other elements cardinality
		const elInputCardinality = connectLines.reduce((elMap, cl) => {
			const elCardinality = elMap.get(cl.target.id) ?? 0;
			return elMap.set(cl.target.id, elCardinality + 1);
		}, new Map<string, number>());

		// leave only element that are allowed to connect and didn't excited cardinality
		const connectableElementIds = Object.values(state.elements)
			.filter((curEl) => {
				if (curEl.id === el.id) {
					return false;
				}

				if (!sourceCpDescriptor.allowedTypes.has(curEl.type)) {
					return false;
				}

				if (payload.type === ConnectPointType.Input) {
					return false;
				}

				const { input = { cardinality: 0, allowedTypes: new Set() } } =
					findElementDescriptor(curEl.type, curEl.properties);
				const inputCardinality = elInputCardinality.get(curEl.id) ?? 0;
				const inputCardinalityNotExcited = inputCardinality < input.cardinality;

				return inputCardinalityNotExcited && input.allowedTypes.has(el.type);
			})
			.map((el) => el.id);

		state.markConnectionPointsAsConnectable(connectableElementIds);
		state.setSelectElements(connectableElementIds);
	},
	stopConnectPointDraw: () => {
		const sourceElId = get().draftConnectLine?.source.id;

		get().changeState(StageState.Select);
		if (!sourceElId) {
			return;
		}

		get().deleteConnectLineDraw();
		get().clearHighlightConnectPoints();
		get().markElementAsSelected(sourceElId);
	},
	startLassoSelection: (startPoint: Point | null) =>
		set((state) => {
			if (!startPoint) {
				return state;
			}

			state.state = StageState.LassoSelect;
			state.lassoSelection = {
				x: startPoint.x,
				y: startPoint.y,
				width: 0,
				height: 0,
			};

			return state;
		}, true),
	updateLassoSelection: (point: Point | null) =>
		set((state) => {
			if (!point || !state.lassoSelection) {
				return state;
			}

			const { x, y } = state.lassoSelection;
			const width = point.x - x;
			const height = point.y - y;
			state.lassoSelection = {
				x,
				y,
				width,
				height,
			};

			return state;
		}, true),
	stopLassoSelection: () =>
		set((state) => {
			state.lassoSelection = null;
			state.state = StageState.Select;

			return state;
		}, true),
	addDraftElement: () => {
		const state = get();

		state.changeState(StageState.Select);
		if (!state.draftElement) {
			return;
		}

		state.addElement(state.draftElement);
		state.createElementConnectPoints(state.draftElement);
		state.clearDraftElement();
	},
	startElementDraw: (payload: CreateElementPayload) => {
		get().changeState(StageState.DrawElement);
		get().createDraftElement(payload);
	},
	stopElementDraw: () => {
		get().changeState(StageState.Select);
		get().clearDraftElement();
	},
	linkConnectLineDraw: (payload: LinkConnectLineDrawPayload) => {
		const currentState = get();
		const { draftConnectLine } = currentState;
		if (currentState.state !== StageState.DrawConnectLine || !draftConnectLine) {
			return;
		}

		currentState.changeState(StageState.Select);
		currentState.addConnectLineDraw(payload);
		currentState.deleteConnectLineDraw();
		currentState.clearAllSelectedElements();
		currentState.clearHighlightConnectPoints();
		currentState.markElementAsSelected(draftConnectLine.source.id);
		currentState.removeAllDrawerAnimations(payload.connectPointId);
	},
	moveElement: (payload: MoveElementPayload) =>
		set((state) => {
			const el = state.elements[payload.id];
			if (!el) {
				return state;
			}

			moveElementToPosition(state, payload);

			const dx = payload.x - el.x;
			const dy = payload.y - el.y;

			moveConnectPointsByDelta(state, {
				ids: [el.id],
				dx,
				dy,
			});

			const connectLines = Object.values(state.connectLines);
			connectLines.forEach((cl) => {
				if (cl.source.id === el.id) {
					moveConnectLinePointsByDelta(state, {
						id: cl.id,
						pointIndexes: [0, 1],
						dx,
						dy,
					});
				}

				if (cl.target.id === el.id) {
					moveConnectLinePointsByDelta(state, {
						id: cl.id,
						pointIndexes: [cl.points.length - 2, cl.points.length - 1],
						dx,
						dy,
					});
				}
			});

			return state;
		}, true),
	moveSelectedElementsByDelta: (payload: MoveByDeltaElementPayload) =>
		set((state) => {
			const selectedElements = state.selectedElements;
			if (selectedElements.length === 0) {
				return state;
			}

			const el = state.elements[payload.referenceElementId];
			if (!el) {
				return state;
			}

			const dx = payload.x - el.x;
			const dy = payload.y - el.y;
			selectedElements.forEach((elId) => {
				moveElementByDelta(state, { id: elId, dx, dy });
			});

			moveConnectPointsByDelta(state, {
				ids: selectedElements,
				dx,
				dy,
			});

			const connectLines = Object.values(state.connectLines);
			connectLines.forEach((cl) => {
				if (selectedElements.includes(cl.source.id)) {
					moveConnectLinePointsByDelta(state, {
						id: cl.id,
						pointIndexes: [0, 1],
						dx,
						dy,
					});
				}

				if (selectedElements.includes(cl.target.id)) {
					moveConnectLinePointsByDelta(state, {
						id: cl.id,
						pointIndexes: [cl.points.length - 2, cl.points.length - 1],
						dx,
						dy,
					});
				}
			});

			return state;
		}, true),
	createDraftElementSnapLines: (position: Point) => {
		const state = get();
		if (!state.draftElement) {
			return [];
		}

		const elements = Object.values(state.elements);
		const { horizontalSnapLines, verticalSnapLines } = createSnapLinesByElement(
			{
				...state.draftElement,
				x: position.x,
				y: position.y,
			},
			elements,
			state.elementSizes,
		);

		const snapLines = [...horizontalSnapLines, ...verticalSnapLines];
		state.setSnapLines(snapLines);

		return snapLines;
	},
	createConnectPointSnapLines: (position: Point) => {
		const state = get();
		if (!state.draftConnectLine) {
			return [];
		}

		const { source } = state.draftConnectLine;
		const elementConnectPoints = state.connectPoints[source.id];
		if (!elementConnectPoints) {
			return [];
		}

		const cp = elementConnectPoints.find((cp) => cp.position === source.connectPosition);
		if (!cp) {
			return [];
		}

		const connectPoints = Object.values(state.connectPoints)
			.flat()
			.filter(
				(curElementCp) => curElementCp.visible && curElementCp.elementId !== cp.elementId,
			);
		const { horizontalSnapLines, verticalSnapLines } = createSnapLinesByConnectPoint(
			position,
			connectPoints,
			state.elementSizes,
		);

		const snapLines = [...horizontalSnapLines, ...verticalSnapLines];
		state.setSnapLines(snapLines);
		return snapLines;
	},
	createElementSnapLines: (payload: CreateElementSnapLinesPayload) => {
		const state = get();
		const el = state.elements[payload.elementId];
		if (!el) {
			return [];
		}

		const elements = Object.values(state.elements).filter(
			(el) => !state.selectedElements.includes(el.id),
		);

		const { horizontalSnapLines, verticalSnapLines } = createSnapLinesByElement(
			{
				...el,
				x: payload.x,
				y: payload.y,
			},
			elements,
			state.elementSizes,
		);

		const snapLines = [...horizontalSnapLines, ...verticalSnapLines];
		state.setSnapLines(snapLines);
		return snapLines;
	},
	pinConnectLine: (payload: PinConnectLinePayload) => {
		const state = get();
		if (!state.draftConnectLine) {
			return;
		}

		state.lockConnectLine(payload.connectPointBoundingBox);
		state.refreshDrawerAnimation({
			drawerId: payload.connectPointId,
			key: AnimationKey.SnapConnectPoint,
		});
	},
	unpinConnectLine: (payload: UnpinConnectLinePayload) => {
		const state = get();
		state.unlockDraftConnectLine();

		if (!payload.animationId) {
			return;
		}

		state.disposeDrawerAnimation({
			drawerId: payload.drawerId,
			animationId: payload.animationId,
		});
	},
	removeSimulationAnimation: (animationId: string) => {
		const state = get();
		const animationIndex = state.simulation.animationsQueue.findIndex(
			(a) => a.id === animationId,
		);

		if (animationIndex === -1) {
			return;
		}

		const animation = state.simulation.animationsQueue[animationIndex];
		const event = animation.data as ObservableEvent;
		if (event?.type === FlowValueType.Error) {
			state.createElementError({
				elementId: event.sourceElementId,
				errorId: event.id,
				errorMessage: event.value,
			});
		} else {
			state.clearErrors();
		}

		state.removeSimulationAnimationAtIndex(animationIndex);
	},
});

function clearCanvasAutoDragInterval(state: RootState) {
	if (!state.canvasState.autoDragInterval) {
		return state;
	}

	clearInterval(state.canvasState.autoDragInterval);
	state.canvasState.autoDragInterval = null;
	return state;
}

export const selectStageState = () => (state: RootState) => state.state;

export const selectLasso = () =>
	useShallow((state: RootState) => {
		if (!state.lassoSelection) {
			return null;
		}

		const [p1, , , p4] = BoundingBox.copy(state.lassoSelection).points.sort((p1, p2) => {
			const dx = p1.x - p2.x;
			return dx != 0 ? dx : p1.y - p2.y;
		});
		const x = Math.min(p1.x, p4.x);
		const y = Math.min(p1.y, p4.y);
		const width = Math.abs(p4.x - p1.x);
		const height = Math.abs(p4.y - p1.y);

		return {
			x,
			y,
			width,
			height,
		};
	});

export const isHighlighted = (elementId: string) => (state: RootState) =>
	state.highlighted.includes(elementId);

export const selectCanvasState = (state: RootState) => state.canvasState;

export const selectElementTooltip = () =>
	useShallow((state: RootState) => {
		const tooltip = state.tooltip;
		if (!tooltip) {
			return null;
		}

		const element = state.elements[tooltip.elementId];
		if (!element) {
			return null;
		}

		const shapeSize = findElementSize(state.elementSizes, element.type);
		const bb = calculateShapeSizeBoundingBox(element, shapeSize);

		const error = state.errors[tooltip.elementId];
		if (error) {
			return {
				id: element.id,
				text: error.errorMessage,
				x: bb.center.x,
				y: bb.topLeft.y,
				width: bb.width,
			};
		}

		const alternativeText = tooltip.text ?? element?.name ?? '';
		if (!alternativeText) {
			return null;
		}

		return {
			id: element.id,
			text: alternativeText,
			x: bb.center.x,
			y: bb.topLeft.y,
			width: bb.width,
		};
	});

export const selectIsDraggable = (state: RootState) =>
	state.simulation.state !== SimulationState.Running && isElementDragAllowed(state.state);

