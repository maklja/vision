import { v1 } from 'uuid';
import { StateCreator } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
	Element,
	ElementProps,
	ElementType,
	EMPTY_ELEMENT,
	mapToOperatorPropsTemplate,
	Point,
} from '@maklja/vision-simulator-model';
import { RootState } from '../rootStore';

export interface UpdateElementPayload<P = ElementProps> {
	id: string;
	name?: string;
	visible?: boolean;
	properties?: P;
}

export interface CreateElementPayload {
	type: ElementType;
	x: number;
	y: number;
}

export interface UpdateElementPropertyPayload {
	id: string;
	propertyName: string;
	propertyValue: unknown;
}

export interface MoveElementPayload {
	id: string;
	x: number;
	y: number;
}

export interface MoveElementByDeltaPayload {
	id: string;
	dx: number;
	dy: number;
}

export interface ElementSlice {
	elements: Record<string, Element>;
	selectedElements: string[];
	draftElement: Element | null;
	loadElements: (elements: Element[]) => void;
	updateElement: (payload: UpdateElementPayload) => void;
	removeElements: (elementIds: string[]) => void;
	createDraftElement: (payload: CreateElementPayload) => void;
	updateDraftElementPosition: (payload: Point) => void;
	addElement: (element: Element) => void;
	clearDraftElement: () => void;
	selectElement: (elementId: string) => void;
	deselectElement: (elementIds: string) => void;
	setSelectElements: (elementIds: string[]) => void;
	updateElementProperty: (payload: UpdateElementPropertyPayload) => void;
	moveElementToPosition: (payload: MoveElementPayload) => void;
	moveElementByDelta: (payload: MoveElementByDeltaPayload) => void;
}

function createElementName(takenElNames: string[], elType: ElementType) {
	let idx = 0;
	let newElName = `${elType}_${idx}`;
	while (takenElNames.includes(newElName)) {
		newElName = `${elType}_${++idx}`;
	}

	return newElName;
}

export const createElementSlice: StateCreator<RootState, [], [], ElementSlice> = (set) => ({
	elements: {},
	selectedElements: [],
	draftElement: null,
	createDraftElement: (payload: CreateElementPayload) =>
		set((state) => {
			const allElementNames = Object.values(state.elements).map((el) => el.name);
			const elName = createElementName(allElementNames, payload.type);
			state.draftElement = {
				...payload,
				visible: true,
				name: elName,
				id: v1(),
				properties: mapToOperatorPropsTemplate(payload.type),
			};
			return state;
		}, true),
	updateDraftElementPosition: (payload: Point) =>
		set((state) => {
			if (!state.draftElement) {
				return state;
			}

			state.draftElement = {
				...state.draftElement,
				x: payload.x,
				y: payload.y,
			};
			return state;
		}, true),
	clearDraftElement: () =>
		set((state) => {
			state.draftElement = null;
			return state;
		}, true),
	addElement: (newElement: Element) =>
		set((state) => {
			state.elements[newElement.id] = newElement;
			return state;
		}, true),
	updateElement: (payload: UpdateElementPayload) =>
		set((state) => {
			const el = state.elements[payload.id];
			if (!el) {
				return state;
			}

			el.name = payload.name ?? el.name;
			el.visible = payload.visible ?? el.visible;
			el.properties = {
				...el.properties,
				...payload.properties,
			};
			return state;
		}, true),
	removeElements: (elementIds: string[]) =>
		set((state) => {
			if (elementIds.length === 0) {
				return state;
			}

			elementIds.forEach((elId) => {
				delete state.elements[elId];
			});
			return state;
		}, true),
	loadElements: (elements: Element[]) =>
		set((state) => {
			state.elements = elements.reduce(
				(elementsDict, el) => ({
					...elementsDict,
					[el.id]: el,
				}),
				{},
			);
			return state;
		}, true),
	setSelectElements: (elementIds: string[]) =>
		set((state) => {
			if (state.selectedElements.length === 0 && elementIds.length === 0) {
				return state;
			}

			state.selectedElements = elementIds;
			return state;
		}, true),
	selectElement: (elementId: string) =>
		set((state) => {
			if (state.selectedElements.includes(elementId)) {
				return state;
			}

			state.selectedElements.push(elementId);
			return state;
		}, true),
	deselectElement: (elementId: string) =>
		set((state) => {
			const idx = state.selectedElements.indexOf(elementId);
			if (idx === -1) {
				return state;
			}

			state.selectedElements.splice(idx, 1);
			return state;
		}, true),
	updateElementProperty: (payload: UpdateElementPropertyPayload) =>
		set((state) => {
			const element = state.elements[payload.id];
			if (!element) {
				return state;
			}

			element.properties[payload.propertyName] = payload.propertyValue;
			return state;
		}, true),
	moveElementToPosition: (payload: MoveElementPayload) =>
		set((state) => moveElementToPosition(state, payload), true),
	moveElementByDelta: (payload: MoveElementByDeltaPayload) =>
		set((state) => moveElementByDelta(state, payload), true),
});

export function moveElementToPosition(state: RootState, payload: MoveElementPayload) {
	const el = state.elements[payload.id];
	if (!el) {
		return state;
	}

	el.x = payload.x;
	el.y = payload.y;

	return state;
}

export function moveElementByDelta(state: RootState, payload: MoveElementByDeltaPayload) {
	const el = state.elements[payload.id];
	if (!el) {
		return state;
	}

	el.x += payload.dx;
	el.y += payload.dy;

	return state;
}

export const selectStageElements = () =>
	useShallow((state: RootState) => Object.values(state.elements));

export const selectStageDraftElement = () => (state: RootState) =>
	state.draftElement ?? EMPTY_ELEMENT;

export const isSelectedElement = (elementId: string) => (state: RootState) =>
	state.selectedElements.includes(elementId);
