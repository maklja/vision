import {
	findOperatorDefinition,
	ElementType,
	PropertyDefinition,
	isParameterValue,
} from '@maklja/vision-simulator-model';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { useStore } from 'zustand';
import { RootStore } from '../store/rootStore';
import { createPersistedDiagram } from './diagramPersistence';

const ExecutionPermission = createContext({ allowed: true, revision: '' });
export const useDiagramExecutionPermission = () => useContext(ExecutionPermission);
export const useDiagramExecutionAllowed = () => useDiagramExecutionPermission().allowed;

export function DiagramExecutionGate({
	store,
	imported,
	blocked = false,
	children,
}: PropsWithChildren<{ store: RootStore; imported: boolean; blocked?: boolean }>) {
	const elements = useStore(store, (s) => s.elements);
	const contextSeed = useStore(store, (s) => s.contextSeed);
	const connectLines = useStore(store, (s) => s.connectLines);
	const [approvedRevision, setApprovedRevision] = useState<string | null>(null);
	// Source only: viewport/theme and transient results do not grant or revoke permission.
	let revision = '';
	try {
		const source = createPersistedDiagram({
			elements,
			contextSeed,
			connectLines,
			canvasState: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
			themeId: 'sea',
		});
		revision = JSON.stringify([source.elements, source.connectLines, source.contextSeed]);
	} catch {
		/* Invalid editor drafts cannot authorize imported execution. */
	}
	const executable =
		imported ||
		Object.keys(contextSeed).length > 0 ||
		Object.values(elements).some(
			(el) =>
				el.type === ElementType.Ajax ||
				Object.values(el.properties).some(
					(value) => isParameterValue(value) && value.kind === 'expression',
				) ||
				(
					Object.values(
						findOperatorDefinition(el.type)?.properties ?? {},
					) as PropertyDefinition[]
				).some((d: PropertyDefinition) => d.kind === 'callback' || d.kind === 'expression'),
		);
	const allowed = !blocked && (!executable || (revision !== '' && revision === approvedRevision));
	return (
		<ExecutionPermission.Provider value={{ allowed, revision }}>
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
						Review this diagram’s code and network requests before running. Code runs
						with this page’s permissions; a Worker is not a sandbox. Stop cannot undo
						network requests or guarantee cleanup after forced termination.
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
