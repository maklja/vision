import { useCallback, useEffect, useRef, useState } from 'react';
import { DiagramDocument } from '@maklja/vision-simulator-model';
import { Simulator } from './simulator';
import { createRootStore, RootStore, StoreContext } from './store/rootStore';
import {
	DiagramRepository,
	reportDiagramLoadError,
	reportDiagramSaveError,
	subscribeDiagramPersistence,
} from './persistence';
import { DiagramFiles } from './persistence/DiagramFiles';
import { DiagramExecutionGate } from './persistence/DiagramExecutionGate';

function App() {
	const [repository] = useState(() => new DiagramRepository());
	const [session, setSession] = useState<{
		store: RootStore;
		document?: DiagramDocument;
		blocked: boolean;
		key: number;
	} | null>(null);
	const [saveFailed, setSaveFailed] = useState(false);
	const [message, setMessage] = useState('Loading diagram…');
	const dispose = useRef<(() => void) | null>(null);
	const generation = useRef(0);

	const load = useCallback(() => {
		const token = ++generation.current;
		dispose.current?.();
		repository
			.load()
			.then((doc) => {
				if (token !== generation.current) return;
				setSession({
					store: createRootStore(doc?.diagram),
					document: doc,
					blocked: false,
					key: token,
				});
				setSaveFailed(false);
				setMessage('Diagram loaded. Changes save automatically.');
			})
			.catch((error) => {
				if (token !== generation.current) return;
				reportDiagramLoadError(error);
				setSession({ store: createRootStore(), blocked: true, key: token });
				setMessage(
					`Saved data was not changed. ${error instanceof Error ? error.message : 'Load failed.'} Use Diagram files to download original data, import a replacement or retry.`,
				);
			});
	}, [repository]);

	useEffect(() => {
		load();
		return () => {
			generation.current++;
			dispose.current?.();
		};
	}, [load]);
	useEffect(() => {
		if (!session || session.blocked) return;
		const stop = subscribeDiagramPersistence(
			session.store,
			(error) => {
				reportDiagramSaveError(error);
				setSaveFailed(true);
				setMessage(
					'Save failed. Automatic retries are bounded; use Export diagram JSON to keep your work.',
				);
			},
			{
				save: (data) => repository.save(data),
				onSaved: () => {
					setSaveFailed(false);
					setMessage('Diagram saved.');
				},
			},
		);
		dispose.current = stop;
		return stop;
	}, [session, repository]);

	async function replace(doc: DiagramDocument) {
		// Cancel pending retries before queuing replacement behind the previous in-flight save.
		dispose.current?.();
		try {
			const saved = await repository.replace(doc);
			setSession({
				store: createRootStore(saved.diagram),
				document: saved,
				blocked: false,
				key: ++generation.current,
			});
			setMessage(
				'Imported diagram saved. Execution requires review each session and after source edits.',
			);
		} catch (error) {
			// Resume the old editor after a failed backup/write. It must not lose its unsaved work.
			setSession((previous) => (previous ? { ...previous } : previous));
			throw error;
		}
	}

	return (
		<div>
			{session && (
				<StoreContext.Provider value={session.store}>
					<DiagramExecutionGate
						key={session.key}
						store={session.store}
						imported={session.document?.origin === 'file'}
						blocked={session.blocked}
					>
						<Simulator key={session.key} />
					</DiagramExecutionGate>
					<DiagramFiles
						store={session.store}
						repository={repository}
						blocked={session.blocked}
						message={message}
						onReplace={replace}
						onRetry={load}
					/>
					{(session.blocked || saveFailed) && (
						<div
							role="alert"
							style={{
								position: 'absolute',
								bottom: 8,
								left: 8,
								zIndex: 30,
								maxWidth: 500,
								background: 'white',
								color: 'black',
								padding: 8,
							}}
						>
							{message}
						</div>
					)}
				</StoreContext.Provider>
			)}
		</div>
	);
}

export default App;
