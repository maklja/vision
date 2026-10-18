import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { useDiagramExecutionPermission } from '../persistence/DiagramExecutionGate';
import { Unsubscribable } from 'rxjs';
import Box from '@mui/material/Box';
import { useShallow } from 'zustand/react/shallow';
import type { FlowValueEvent, ExecutionDiagnostic } from '@maklja/vision-simulator-engine';
import {
	ConnectLine,
	Element,
	isEntryOperatorType,
	resultOperators,
} from '@maklja/vision-simulator-model';
import { SimulationControls } from '../ui';
import { useRootStore } from '../store/rootStore';
import { selectSimulation } from '../store/simulation';
import { selectStageElements } from '../store/elements';
import { selectStageConnectLines } from '../store/connectLines';
import { calculateShapeSizeBoundingBox, findElementSize } from '../theme';

export interface SimulatorControlsProps {
	stage: Konva.Stage | null;
}

export function SimulatorControls({ stage }: SimulatorControlsProps) {
	const [entryId, setEntryId] = useState('');
	const [readiness, setReadiness] = useState({ revision: '', error: '' });
	const [watchdogSeconds, setWatchdogSeconds] = useState(5);
	const [diagnostics, setDiagnostics] = useState<ExecutionDiagnostic[]>([]);
	const contextSeed = useRootStore((s) => s.contextSeed);
	const setContextSeed = useRootStore((s) => s.setContextSeed);
	const [seedDraft, setSeedDraft] = useState(() => JSON.stringify(contextSeed, null, 2));
	const [seedError, setSeedError] = useState('');
	const simulation = useRootStore(selectSimulation);
	const elements = useRootStore(selectStageElements());
	const entryElements = useRootStore(
		useShallow((state) =>
			Object.values(state.elements)
				.filter((el) => isEntryOperatorType(el.type))
				.sort((el1, el2) => el1.name.localeCompare(el2.name)),
		),
	);
	const elementSizes = useRootStore((state) => state.elementSizes);
	const connectLines = useRootStore(selectStageConnectLines());
	const clearAllSelectedElements = useRootStore((state) => state.clearAllSelectedElements);
	const createElementError = useRootStore((state) => state.createElementError);
	const clearErrors = useRootStore((state) => state.clearErrors);
	const startSimulation = useRootStore((state) => state.startSimulation);
	const resetSimulation = useRootStore((state) => state.resetSimulation);
	const completeSimulation = useRootStore((state) => state.completeSimulation);
	const simulateObservableEvent = useRootStore((state) => state.simulateObservableEvent);
	const updateCanvasState = useRootStore((state) => state.updateCanvasState);
	const setSelectElements = useRootStore((state) => state.setSelectElements);
	const permission = useDiagramExecutionPermission();
	const sourceRevision = JSON.stringify([
		entryId,
		elements.filter((el) => !resultOperators.has(el.type)),
		connectLines,
	]);
	const ready = readiness.revision === sourceRevision && !readiness.error;
	useEffect(() => {
		let current = true;
		const [entry, sources, lines] = JSON.parse(sourceRevision) as [
			string,
			Element[],
			ConnectLine[],
		];
		if (!entry) return;
		import('@maklja/vision-simulator-engine')
			.then(({ createSimulationModel, preflight, ExecutionError }) => {
				let error = '';
				try {
					preflight(createSimulationModel(entry, sources, lines).getReachableElements());
				} catch (failure) {
					error =
						failure instanceof ExecutionError
							? `${failure.diagnostic.elementId}.${failure.diagnostic.field ?? 'properties'}: ${failure.message}`
							: failure instanceof Error
								? failure.message
								: 'Invalid execution parameters';
				}
				if (current) setReadiness({ revision: sourceRevision, error });
			})
			.catch(() => {
				if (current)
					setReadiness({ revision: sourceRevision, error: 'Validation could not load.' });
			});
		return () => {
			current = false;
		};
	}, [sourceRevision]);
	const executionAllowed = permission.allowed && ready;
	const latestPermission = useRef(permission);
	latestPermission.current = permission;
	const simulationSubscription = useRef<Unsubscribable | null>(null);
	const mounted = useRef(true);
	const generation = useRef(0);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			generation.current++;
			simulationSubscription.current?.unsubscribe();
		};
	}, []);

	async function handleSimulationStart(entryElementId: string) {
		if (!entryElementId || !executionAllowed) {
			return;
		}

		const request = ++generation.current;
		const requestedRevision = permission.revision;
		const { startObservableSimulation } = await import('@maklja/vision-simulator-engine');
		// The chunk may arrive after source edits revoke approval (or approve another revision).
		if (
			!mounted.current ||
			request !== generation.current ||
			!latestPermission.current.allowed ||
			latestPermission.current.revision !== requestedRevision
		)
			return;

		const dispatchObservableEvent = (event: FlowValueEvent) => {
			if (request !== generation.current) return;
			simulateObservableEvent({
				id: event.id,
				hash: event.hash,
				index: event.index,
				connectLinesId: [...event.connectLinesId],
				sourceElementId: event.sourceElementId,
				targetElementId: event.targetElementId,
				type: event.type,
				value: event.value,
				subscribeId: event.subscribeId,
				dependencies: [...event.dependencies],
			});
		};

		clearErrors();
		setDiagnostics([]);
		startSimulation();
		clearAllSelectedElements();
		const pending: { current?: Unsubscribable } = {};
		pending.current = startObservableSimulation({
			entryElementId,
			trusted: executionAllowed,
			contextSeed,
			watchdogSeconds,
			onDiagnostic: (diagnostic) =>
				setDiagnostics((previous) => [
					...previous.filter((d) => !d.omittedCount).slice(-99),
					diagnostic,
				]),
			elements,
			connectLines,
			onNext: dispatchObservableEvent,
			onError: (error) => {
				dispatchObservableEvent(error);
				pending.current?.unsubscribe();
			},
			onComplete: () => {
				if (request !== generation.current) return;
				completeSimulation();
				pending.current?.unsubscribe();
			},
			onCreationError: (creationErrorEvent) => {
				if (request !== generation.current) return;
				pending.current?.unsubscribe();
				resetSimulation();
				createElementError(creationErrorEvent);
			},
		});
		simulationSubscription.current = pending.current;
	}

	function handleSimulationStop() {
		generation.current++;
		simulationSubscription.current?.unsubscribe();
		simulationSubscription.current = null;
		resetSimulation();
	}

	function handleSimulationReset(entryElementId: string) {
		generation.current++;
		simulationSubscription.current?.unsubscribe();
		simulationSubscription.current = null;

		resetSimulation();
		handleSimulationStart(entryElementId);
	}

	function handleElementLocate(element: Element) {
		if (!stage) {
			return;
		}

		const shapeSize = findElementSize(elementSizes, element.type);
		const elementCenter = calculateShapeSizeBoundingBox(
			{ x: element.x, y: element.y },
			shapeSize,
		).center;

		const x = -elementCenter.x + stage.width() / 2;
		const y = -elementCenter.y + stage.height() / 2;

		stage.scale({ x: 1, y: 1 });
		stage.position({
			x,
			y,
		});
		updateCanvasState({
			x,
			y,
			scaleX: 1,
			scaleY: 1,
		});
		clearAllSelectedElements();
		setSelectElements([element.id]);
	}

	return (
		<Box
			sx={{
				position: 'absolute',
				top: '5px',
				left: 'calc(50% - 160px)',
				width: '400px',
				height: '40px',
			}}
		>
			<SimulationControls
				onEntryElementChange={setEntryId}
				executionAllowed={executionAllowed && !seedError}
				simulatorId={simulation.id}
				simulationState={simulation.state}
				entryElements={entryElements}
				simulationResults={simulation.results}
				onSimulationStart={handleSimulationStart}
				onSimulationStop={handleSimulationStop}
				onSimulationReset={handleSimulationReset}
				onElementLocate={handleElementLocate}
			/>
			<details
				style={{
					background: 'white',
					color: 'black',
					padding: 8,
					maxHeight: '60vh',
					overflow: 'auto',
				}}
			>
				<summary>Execution settings and diagnostics</summary>
				<label>
					Watchdog seconds (1–60)
					<input
						aria-label="Watchdog seconds"
						type="number"
						min={1}
						max={60}
						value={watchdogSeconds}
						onChange={(event) => setWatchdogSeconds(Number(event.target.value))}
					/>
				</label>
				<p>
					Source silence is allowed while the Worker responds. Background throttling may
					trigger cancellation.
				</p>
				<label>
					Context seed (JSON object)
					<textarea
						aria-label="Context seed"
						value={seedDraft}
						onChange={(event) => {
							setSeedDraft(event.target.value);
							try {
								setContextSeed(JSON.parse(event.target.value));
								setSeedError('');
							} catch {
								setSeedError(
									'Enter a finite JSON object, at most 1 MiB and depth 64.',
								);
							}
						}}
					/>
				</label>
				{seedError && <p role="alert">{seedError}</p>}
				{readiness.revision === sourceRevision && readiness.error && (
					<p role="alert">{readiness.error}</p>
				)}
				<ul aria-label="Execution diagnostics" aria-live="polite">
					{diagnostics.map((d, index) => (
						<li key={index} tabIndex={0}>
							{d.category}: {d.elementId} {d.field} — {d.message}
						</li>
					))}
				</ul>
			</details>
		</Box>
	);
}
