import { ChangeEvent, useState } from 'react';
import { useStore } from 'zustand';
import {
	DiagramDocument,
	MAX_DIAGRAM_BYTES,
	parseDiagramFile,
} from '@maklja/vision-simulator-model';
import { RootStore } from '../store/rootStore';
import { SimulationState } from '../store/simulation';
import { createPersistedDiagram, DiagramRepository } from './diagramPersistence';

export function downloadJson(value: unknown, filename: string) {
	const source = JSON.stringify(value, null, 2);
	if (source === undefined) throw new Error('No saved data is available.');
	const url = URL.createObjectURL(new Blob([source], { type: 'application/json' }));
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	try {
		document.body.append(link);
		link.click();
	} finally {
		link.remove();
		// Keep the URL alive through the browser download task, then release it.
		setTimeout(() => URL.revokeObjectURL(url), 0);
	}
}

export function DiagramFiles({
	store,
	repository,
	blocked,
	message,
	onReplace,
	onRetry,
}: {
	store: RootStore;
	repository: DiagramRepository;
	blocked: boolean;
	message: string;
	onReplace: (doc: DiagramDocument) => Promise<void>;
	onRetry: () => void;
}) {
	const running = useStore(store, (s) => s.simulation.state === SimulationState.Running);
	const [busy, setBusy] = useState(false);
	const [feedback, setFeedback] = useState('');
	async function action(work: () => Promise<void>) {
		setBusy(true);
		setFeedback('');
		try {
			await work();
		} catch (error) {
			console.error('Diagram file operation failed.', error);
			setFeedback(error instanceof Error ? error.message : 'File operation failed.');
		} finally {
			setBusy(false);
		}
	}
	async function importFile(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;
		await action(async () => {
			if (file.size > MAX_DIAGRAM_BYTES)
				throw new Error('File exceeds the 5 MiB diagram limit.');
			const doc = parseDiagramFile(await file.text());
			// Validation and user choice precede any storage replacement; import never runs the graph.
			await onReplace(doc);
			setFeedback('Imported without running code. Review before allowing execution.');
		});
	}
	return (
		<details
			style={{
				position: 'absolute',
				top: 8,
				left: 8,
				zIndex: 25,
				maxWidth: 280,
				background: 'white',
				color: 'black',
				padding: 6,
			}}
		>
			<summary>Diagram files</summary>
			<p>
				Import replaces this diagram after backing up its saved data. Imports do not run
				code or grant execution permission.
			</p>
			<label>
				Import diagram JSON{' '}
				<input
					aria-label="Import diagram JSON"
					type="file"
					accept=".json,application/json"
					disabled={busy || running}
					onChange={importFile}
				/>
			</label>
			<button
				disabled={busy || blocked}
				onClick={() =>
					action(async () => {
						const state = store.getState();
						const doc = repository.documentForExport(
							createPersistedDiagram({
								...state,
								themeId: state.theme.default.colors.id,
							}),
						);
						downloadJson(doc, 'diagram.json');
						setFeedback('Diagram exported.');
					})
				}
			>
				Export diagram JSON
			</button>
			{blocked && (
				<button disabled={busy} onClick={onRetry}>
					Retry loading saved diagram
				</button>
			)}
			<p role="status" aria-live="polite">
				{busy ? 'Working…' : feedback || message}
			</p>
		</details>
	);
}
