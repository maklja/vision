import { get, set } from 'idb-keyval';
import { shallow } from 'zustand/shallow';
import { ConnectLine, Element, resultOperators } from '@maklja/vision-simulator-model';
import { RootStore, StateProps } from '../store/rootStore';
import type { CanvasState } from '../store/stage';

// TODO temp solution until multiple tabs are added
export const diagramId = 'test';

export interface PersistableDiagramState {
	elements: Record<string, Element>;
	connectLines: Record<string, ConnectLine>;
	canvasState: Pick<CanvasState, 'x' | 'y' | 'scaleX' | 'scaleY'> & Partial<CanvasState>;
	themeId: string;
}

export function createPersistedDiagram(state: PersistableDiagramState): StateProps {
	return {
		elements: Object.values(state.elements).filter((el) => !resultOperators.has(el.type)),
		connectLines: Object.values(state.connectLines),
		canvasState: {
			x: state.canvasState.x,
			y: state.canvasState.y,
			scaleX: state.canvasState.scaleX,
			scaleY: state.canvasState.scaleY,
		},
		themeId: state.themeId,
	};
}

export function loadDiagram(): Promise<StateProps | undefined> {
	return get<StateProps>(diagramId);
}

export function persistDiagram(diagram: StateProps): Promise<void> {
	return set(diagramId, diagram);
}

export function reportDiagramLoadError(error: unknown) {
	console.error(`Failed to load data from database. ${error}`);
}

export function reportDiagramSaveError(error: unknown) {
	console.error(`Failed to save data to database. ${error}`);
}

export function subscribeDiagramPersistence(
	store: RootStore,
	onError: (error: unknown) => void = reportDiagramSaveError,
): () => void {
	return store.subscribe(
		(state) => ({
			elements: state.elements,
			connectLines: state.connectLines,
			canvasState: state.canvasState,
			themeId: state.theme.default.colors.id,
		}),
		(state) => {
			persistDiagram(createPersistedDiagram(state)).catch(onError);
		},
		{
			equalityFn: shallow,
		},
	);
}
