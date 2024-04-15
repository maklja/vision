import { StateCreator } from 'zustand';
import { RootState } from '../rootState';
import { useShallow } from 'zustand/react/shallow';
import { produce } from 'immer';
import {
	createElementSizesContext,
	createThemeContext,
	ElementSizesContext,
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
} from '../../model';
import { CreateElementPayload, MoveElementPayload } from '../elements';
import { LinkConnectLineDrawPayload } from '../connectLines';
import { createSnapLinesByConnectPoint, createSnapLinesByElement } from '../snapLines';
import { AnimationKey } from '../../animation';
import { ObservableEvent } from '../simulation';
import { FlowValueType } from '../../engine';

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

export interface UnpinConnectLinePayload {
	drawerId: string;
	animationId: string | null;
}

export enum StageState {
	Select = 'select',
	LassoSelect = 'lassoSelect',
	DrawConnectLine = 'drawConnectLine',
	Dragging = 'dragging',
	SnapDragging = 'snapDragging',
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
}

const draggingStates = [StageState.Dragging, StageState.SnapDragging];
const draggableStates = [StageState.Select, StageState.Dragging, StageState.SnapDragging];

export const isStageStateDragging = (state: StageState) => draggingStates.includes(state);

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
	load: (elements: Element[]) => void;
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
	createDraftElementSnapLines: () => void;
	createConnectPointSnapLines: () => void;
	createElementSnapLines: (referenceElementId: string) => void;
	showTooltip: (payload: ShowTooltipPayload) => void;
	hideTooltip: () => void;
	setHighlighted: (highlightElements: string[]) => void;
	updateCanvasState: (canvasUpdate: Partial<CanvasState>) => void;
	pinConnectLine: (payload: PinConnectLinePayload) => void;
	unpinConnectLine: (payload: UnpinConnectLinePayload) => void;
	removeSimulationAnimation: (animationId: string) => void;
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
	},
	updateCanvasState: (canvasUpdate: Partial<CanvasState>) =>
		set(
			produce<RootState>((state) => {
				state.canvasState = {
					...state.canvasState,
					...canvasUpdate,
				};
			}),
		),
	setHighlighted: (highlightElements: string[]) =>
		set(
			produce<RootState>((state) => {
				state.highlighted = highlightElements;
			}),
		),
	showTooltip: (payload: ShowTooltipPayload) =>
		set(
			produce<RootState>((state) => {
				state.tooltip = {
					elementId: payload.elementId,
					text: payload.text ?? null,
				};
			}),
		),
	hideTooltip: () =>
		set(
			produce<RootState>((state) => {
				state.tooltip = null;
			}),
		),
	changeState: (newState: StageState) =>
		set(
			produce<RootState>((state) => {
				state.state = newState;
			}),
		),
	load: (elements: Element[]) => {
		const state = get();
		state.loadElements(elements);
		state.loadConnectPoints(elements);
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
		set(
			produce<RootState>((state) => {
				if (!startPoint) {
					return;
				}

				state.state = StageState.LassoSelect;
				state.lassoSelection = {
					x: startPoint.x,
					y: startPoint.y,
					width: 0,
					height: 0,
				};
			}),
		),
	updateLassoSelection: (point: Point | null) =>
		set(
			produce<RootState>((state) => {
				if (!point || !state.lassoSelection) {
					return;
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
			}),
		),
	stopLassoSelection: () =>
		set(
			produce<RootState>((state) => {
				state.lassoSelection = null;
				state.state = StageState.Select;
			}),
		),
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
	moveElement: (payload: MoveElementPayload) => {
		const state = get();

		const el = state.elements[payload.id];
		if (!el) {
			return;
		}

		state.moveElementToPosition(payload);

		const dx = payload.x - el.x;
		const dy = payload.y - el.y;

		state.moveConnectPointsByDelta({
			ids: [el.id],
			dx,
			dy,
		});

		const connectLines = Object.values(state.connectLines);
		connectLines.forEach((cl) => {
			if (cl.source.id === el.id) {
				state.moveConnectLinePointsByDelta({
					id: cl.id,
					pointIndexes: [0, 1],
					dx,
					dy,
				});
			}

			if (cl.target.id === el.id) {
				state.moveConnectLinePointsByDelta({
					id: cl.id,
					pointIndexes: [cl.points.length - 2, cl.points.length - 1],
					dx,
					dy,
				});
			}
		});
	},
	moveSelectedElementsByDelta: (payload: MoveByDeltaElementPayload) => {
		const state = get();
		const selectedElements = state.selectedElements;
		if (selectedElements.length === 0) {
			return;
		}

		const el = state.elements[payload.referenceElementId];
		if (!el) {
			return;
		}

		const dx = payload.x - el.x;
		const dy = payload.y - el.y;

		selectedElements.forEach((elId) => {
			const el = state.elements[elId];
			if (!el) {
				return;
			}

			state.moveElementToPosition({
				id: el.id,
				x: el.x + dx,
				y: el.y + dy,
			});
		});

		state.moveConnectPointsByDelta({
			ids: selectedElements,
			dx,
			dy,
		});

		const connectLines = Object.values(state.connectLines);
		connectLines.forEach((cl) => {
			if (cl.source.id === el.id) {
				state.moveConnectLinePointsByDelta({
					id: cl.id,
					pointIndexes: [0, 1],
					dx,
					dy,
				});
			}

			if (cl.target.id === el.id) {
				state.moveConnectLinePointsByDelta({
					id: cl.id,
					pointIndexes: [cl.points.length - 2, cl.points.length - 1],
					dx,
					dy,
				});
			}
		});
	},
	createDraftElementSnapLines: () => {
		const state = get();
		if (!state.draftElement) {
			return;
		}

		const elements = Object.values(state.elements);
		const { horizontalSnapLines, verticalSnapLines } = createSnapLinesByElement(
			state.draftElement,
			elements,
			state.elementSizes,
		);
		state.setSnapLines([...horizontalSnapLines, ...verticalSnapLines]);
		const [horizontalSnapLine] = horizontalSnapLines;
		const [verticalSnapLine] = verticalSnapLines;
		const x = verticalSnapLine
			? state.draftElement.x + verticalSnapLine.distance
			: state.draftElement.x;
		const y = horizontalSnapLine
			? state.draftElement.y + horizontalSnapLine.distance
			: state.draftElement.y;

		state.updateDraftElementPosition({
			x,
			y,
		});
	},
	createConnectPointSnapLines: () => {
		const state = get();
		if (!state.draftConnectLine) {
			return;
		}

		const { source, points } = state.draftConnectLine;
		const elementConnectPoints = state.connectPoints[source.id];
		if (!elementConnectPoints) {
			return;
		}

		const cp = elementConnectPoints.find((cp) => cp.position === source.connectPosition);
		if (!cp) {
			return;
		}

		const connectPoints = Object.values(state.connectPoints)
			.flat()
			.filter((curElementCp) => curElementCp.elementId !== cp.elementId);
		const currentPosition = points[points.length - 1];
		const { horizontalSnapLines, verticalSnapLines } = createSnapLinesByConnectPoint(
			currentPosition,
			connectPoints,
			state.elementSizes,
		);

		state.setSnapLines([...horizontalSnapLines, ...verticalSnapLines]);

		const [horizontalSnapLine] = horizontalSnapLines;
		const [verticalSnapLine] = verticalSnapLines;

		const x = verticalSnapLine
			? currentPosition.x - verticalSnapLine.distance
			: currentPosition.x;
		const y = horizontalSnapLine
			? currentPosition.y - horizontalSnapLine.distance
			: currentPosition.y;

		state.moveConnectLineDraw({
			position: { x, y },
			normalizePosition: false,
		});
	},
	createElementSnapLines: (referenceElementId: string) => {
		const state = get();
		const el = state.elements[referenceElementId];
		if (!el) {
			return;
		}

		const elements = Object.values(state.elements).filter(
			(el) => !state.selectedElements.includes(el.id),
		);

		const { horizontalSnapLines, verticalSnapLines } = createSnapLinesByElement(
			el,
			elements,
			state.elementSizes,
		);

		state.setSnapLines([...horizontalSnapLines, ...verticalSnapLines]);

		const [horizontalSnapLine] = horizontalSnapLines;
		const [verticalSnapLine] = verticalSnapLines;
		const x = verticalSnapLine ? el.x + verticalSnapLine.distance : el.x;
		const y = horizontalSnapLine ? el.y + horizontalSnapLine.distance : el.y;

		state.moveSelectedElementsByDelta({
			referenceElementId,
			x,
			y,
		});
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

export const selectTooltip = (state: RootState) => state.tooltip;

export const isHighlighted = (elementId: string) =>
	(state: RootState) => state.highlighted.includes(elementId);

export const selectCanvasState = (state: RootState) => state.canvasState;
