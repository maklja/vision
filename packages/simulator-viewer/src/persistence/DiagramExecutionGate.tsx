import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { useStore } from 'zustand';
import { RootStore } from '../store/rootStore';
import { createPersistedDiagram } from './diagramPersistence';

const ExecutionPermission = createContext(true);
export const useDiagramExecutionAllowed = () => useContext(ExecutionPermission);

export function DiagramExecutionGate({
	store,
	imported,
	blocked = false,
	children,
}: PropsWithChildren<{ store: RootStore; imported: boolean; blocked?: boolean }>) {
	const elements = useStore(store, (s) => s.elements);
	const connectLines = useStore(store, (s) => s.connectLines);
	const [approvedRevision, setApprovedRevision] = useState<string | null>(null);
	// Source only: viewport/theme and transient results do not grant or revoke permission.
	let revision = '';
	try {
		const source = createPersistedDiagram({
			elements,
			connectLines,
			canvasState: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
			themeId: 'sea',
		});
		revision = JSON.stringify([source.elements, source.connectLines]);
	} catch {
		/* Invalid editor drafts cannot authorize imported execution. */
	}
	const allowed = !blocked && (!imported || (revision !== '' && revision === approvedRevision));
	return (
		<ExecutionPermission.Provider value={allowed}>
			{!allowed && !blocked && (
				<div
					role="alert"
					style={{
						position: 'absolute',
						bottom: 8,
						right: 8,
						maxWidth: 280,
						zIndex: 30,
						background: 'white',
						color: 'black',
						padding: 8,
					}}
				>
					<p>
						Imported diagram. Review its code and network requests before running. Code
						runs with this page’s permissions; a Worker is not a sandbox.
					</p>
					<button onClick={() => setApprovedRevision(revision)} disabled={!revision}>
						Allow execution for this revision
					</button>
				</div>
			)}
			{children}
		</ExecutionPermission.Provider>
	);
}
