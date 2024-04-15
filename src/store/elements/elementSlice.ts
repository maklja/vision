import { produce } from 'immer';
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
} from '../../model';
import { RootState } from '../rootState';

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
		set(
			produce<RootState>((state) => {
				const allElementNames = Object.values(state.elements).map((el) => el.name);
				const elName = createElementName(allElementNames, payload.type);
				state.draftElement = {
					...payload,
					visible: true,
					name: elName,
					id: v1(),
					properties: mapToOperatorPropsTemplate(payload.type),
				};
			}),
		),
	updateDraftElementPosition: (payload: Point) =>
		set(
			produce<RootState>((state) => {
				if (!state.draftElement) {
					return;
				}

				state.draftElement = {
					...state.draftElement,
					x: payload.x,
					y: payload.y,
				};
			}),
		),
	clearDraftElement: () =>
		set(
			produce<RootState>((state) => {
				state.draftElement = null;
			}),
		),
	addElement: (newElement: Element) =>
		set(
			produce<RootState>((state) => {
				state.elements[newElement.id] = newElement;
			}),
		),
	updateElement: (payload: UpdateElementPayload) =>
		set(
			produce<RootState>((state) => {
				const el = state.elements[payload.id];
				if (!el) {
					return;
				}

				el.name = payload.name ?? el.name;
				el.visible = payload.visible ?? el.visible;
				el.properties = {
					...el.properties,
					...payload.properties,
				};
			}),
		),
	removeElements: (elementIds: string[]) =>
		set(
			produce<RootState>((state) => {
				if (elementIds.length === 0) {
					return;
				}

				elementIds.forEach((elId) => {
					delete state.elements[elId];
				});
			}),
		),
	loadElements: (elements: Element[]) =>
		set(
			produce<RootState>((state) => {
				state.elements = elements.reduce(
					(elementsDict, el) => ({
						...elementsDict,
						[el.id]: el,
					}),
					{},
				);
			}),
		),
	setSelectElements: (elementIds: string[]) =>
		set(
			produce<RootState>((state) => {
				if (state.selectedElements.length === 0 && elementIds.length === 0) {
					return;
				}

				state.selectedElements = elementIds;
			}),
		),
	selectElement: (elementId: string) =>
		set(
			produce<RootState>((state) => {
				if (state.selectedElements.includes(elementId)) {
					return;
				}

				state.selectedElements.push(elementId);
			}),
		),
	deselectElement: (elementId: string) =>
		set(
			produce<RootState>((state) => {
				const idx = state.selectedElements.indexOf(elementId);
				if (idx === -1) {
					return;
				}

				state.selectedElements.splice(idx, 1);
			}),
		),
	updateElementProperty: (payload: UpdateElementPropertyPayload) =>
		set(
			produce<RootState>((state) => {
				const element = state.elements[payload.id];
				if (!element) {
					return;
				}

				element.properties[payload.propertyName] = payload.propertyValue;
			}),
		),
	moveElementToPosition: (payload: MoveElementPayload) =>
		set(
			produce<RootState>((state) => {
				const el = state.elements[payload.id];
				if (!el) {
					return;
				}

				el.x = payload.x;
				el.y = payload.y;
			}),
		),
});

export const selectStageElements = () =>
	useShallow((state: RootState) => Object.values(state.elements));

export const selectStageDraftElement = () => (state: RootState) =>
	state.draftElement ?? EMPTY_ELEMENT;

export const isSelectedElement = (elementId: string) => (state: RootState) =>
	state.selectedElements.includes(elementId);

export const selectStageElementById = (id: string | null) =>
	(state: RootState) => (!id ? null : state.elements[id] ?? null);

