import { ConnectLine, Element } from '@maklja/vision-simulator-model';

/**
 * Shape of the diagram persisted by the viewer under `keyval-store`/`keyval`/`test`.
 * It mirrors the serialized editor state without depending on viewer-only modules.
 */
export interface PersistedCanvasState {
	x: number;
	y: number;
	scaleX: number;
	scaleY: number;
}

export interface PersistedDiagram {
	elements: Element[];
	connectLines: ConnectLine[];
	canvasState: PersistedCanvasState;
	themeId: string;
}

export function findElementById(
	diagram: PersistedDiagram | undefined,
	id: string,
): Element | undefined {
	return diagram?.elements.find((element) => element.id === id);
}

export function findElementByName(
	diagram: PersistedDiagram | undefined,
	name: string,
): Element | undefined {
	return diagram?.elements.find((element) => element.name === name);
}

export function requireElementByName(diagram: PersistedDiagram, name: string): Element {
	const element = findElementByName(diagram, name);
	if (!element) {
		throw new Error(`No persisted element named "${name}"`);
	}

	return element;
}

export function requireConnectLineById(diagram: PersistedDiagram, id: string): ConnectLine {
	const connectLine = diagram.connectLines.find((candidate) => candidate.id === id);
	if (!connectLine) {
		throw new Error(`No persisted connect line with id "${id}"`);
	}

	return connectLine;
}
