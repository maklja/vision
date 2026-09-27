import { expect, test } from '@playwright/test';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	FlowValueType,
} from '@maklja/vision-simulator-model';
import {
	addOperator,
	bootstrapEditor,
	connectOperators,
	observableInputTargets,
	selectElement,
	selectEntryOperator,
	setObservableInputIndex,
	startSimulation,
} from './support/editor';
import { PersistedDiagram, requireConnectLineById } from './support/diagram';
import { waitForDiagram, waitForDiagramCounts } from './support/indexedDb';
import { installWorkerProbe, WorkerProbeSnapshot, waitForWorkerProbe } from './support/workerProbe';

/** `next` worker messages carry the engine's flow value event. */
interface FlowValueEventPayload {
	type: FlowValueType;
	value: string;
	sourceElementId: string;
	targetElementId: string;
	connectLinesId: string[];
}

function flowValueEvents(probe: WorkerProbeSnapshot): FlowValueEventPayload[] {
	return probe.inbound
		.filter((message) => message.type === 'next')
		.map((message) => message.value as FlowValueEventPayload);
}

function connectLineIndex(diagram: PersistedDiagram, connectLineId: string): number {
	return requireConnectLineById(diagram, connectLineId).index;
}

test('runs a concat branch and join graph with edited reference order in the worker', async ({
	page,
}) => {
	await installWorkerProbe(page);
	await bootstrapEditor(page);

	// Every position is the world center of the dropped operator. The layout keeps each
	// element, connect point, and wire clear of the operator palette and properties window.
	const ofReference = await addOperator(page, 'creation operators', ElementType.Of, {
		x: 480,
		y: 140,
	});
	await waitForDiagramCounts(page, 1, 0);
	const rangeReference = await addOperator(page, 'creation operators', ElementType.Range, {
		x: 480,
		y: 520,
	});
	await waitForDiagramCounts(page, 2, 0);
	const concat = await addOperator(page, 'join creation operators', ElementType.Concat, {
		x: 700,
		y: 330,
	});
	await waitForDiagramCounts(page, 3, 0);
	const ofSubscriber = await addOperator(page, 'subscriber', ElementType.Subscriber, {
		x: 780,
		y: 130,
	});
	await waitForDiagramCounts(page, 4, 0);
	const rangeSubscriber = await addOperator(page, 'subscriber', ElementType.Subscriber, {
		x: 780,
		y: 510,
	});
	await waitForDiagramCounts(page, 5, 0);
	const concatSubscriber = await addOperator(page, 'subscriber', ElementType.Subscriber, {
		x: 860,
		y: 330,
	});
	await waitForDiagramCounts(page, 6, 0);

	// The reference branches enter concat through its two event connect points.
	const ofEventLine = await connectOperators(page, concat, ofReference, {
		sourcePosition: ConnectPointPosition.Top,
	});
	await waitForDiagramCounts(page, 6, 1);
	const rangeEventLine = await connectOperators(page, concat, rangeReference, {
		sourcePosition: ConnectPointPosition.Bottom,
	});
	await waitForDiagramCounts(page, 6, 2);

	// The engine graph contract requires one subscriber terminating every branch.
	await connectOperators(page, concat, concatSubscriber);
	await waitForDiagramCounts(page, 6, 3);
	await connectOperators(page, ofReference, ofSubscriber);
	await waitForDiagramCounts(page, 6, 4);
	await connectOperators(page, rangeReference, rangeSubscriber);
	const diagram = await waitForDiagramCounts(page, 6, 5);

	expect(diagram.elements.map((element) => element.id).sort()).toEqual(
		[
			concat.id,
			ofReference.id,
			rangeReference.id,
			concatSubscriber.id,
			ofSubscriber.id,
			rangeSubscriber.id,
		].sort(),
	);
	expect(new Set(diagram.connectLines.map((line) => line.id)).size).toBe(5);

	const eventLines = diagram.connectLines.filter(
		(line) => line.source.connectPointType === ConnectPointType.Event,
	);
	expect(eventLines).toHaveLength(2);

	const ofEvent = requireConnectLineById(diagram, ofEventLine.id);
	expect(ofEvent.source.id).toBe(concat.id);
	expect(ofEvent.source.connectPosition).toBe(ConnectPointPosition.Top);
	expect(ofEvent.target.id).toBe(ofReference.id);
	expect(ofEvent.target.connectPosition).toBe(ConnectPointPosition.Left);
	expect(ofEvent.index).toBe(1);

	const rangeEvent = requireConnectLineById(diagram, rangeEventLine.id);
	expect(rangeEvent.source.id).toBe(concat.id);
	expect(rangeEvent.source.connectPosition).toBe(ConnectPointPosition.Bottom);
	expect(rangeEvent.target.id).toBe(rangeReference.id);
	expect(rangeEvent.target.connectPosition).toBe(ConnectPointPosition.Left);
	expect(rangeEvent.index).toBe(2);

	// Configure the range reference through its rendered property form.
	await selectElement(page, rangeReference);
	await page.getByLabel('Start', { exact: true }).fill('10');
	await page.getByLabel('Count', { exact: true }).fill('2');
	await waitForDiagram(page, (current) => {
		const range = current?.elements.find((element) => element.id === rangeReference.id);
		const properties = range?.properties as { start?: number; count?: number } | undefined;
		return properties?.start === 10 && properties?.count === 2;
	});

	// Reorder concat's event lines so the range reference subscribes first.
	await selectElement(page, concat);
	expect(await observableInputTargets(page)).toEqual(['of', 'range']);
	await setObservableInputIndex(page, 'of', 2);
	await setObservableInputIndex(page, 'range', 1);
	const reordered = await waitForDiagram(page, (current) => {
		if (!current) {
			return false;
		}

		return (
			connectLineIndex(current, ofEventLine.id) === 2 &&
			connectLineIndex(current, rangeEventLine.id) === 1
		);
	});
	expect(requireConnectLineById(reordered, ofEventLine.id).index).toBe(2);
	expect(requireConnectLineById(reordered, rangeEventLine.id).index).toBe(1);

	await selectEntryOperator(page, concat);
	await startSimulation(page);

	const probe = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.inbound.some((message) => message.type === 'complete'),
	);
	expect(probe.created).toBe(1);
	expect(probe.terminated).toBe(1);
	expect(probe.inbound.map((message) => message.type)).toContain('complete');
	expect(probe.outbound.map((message) => message.type)).toEqual([
		'startSimulation',
		'stopSimulation',
	]);

	const events = flowValueEvents(probe);
	const concatValues = events
		.filter(
			(event) =>
				event.type === FlowValueType.Next &&
				event.sourceElementId === concat.id &&
				event.targetElementId === concatSubscriber.id,
		)
		.map((event) => event.value);
	expect(concatValues).toEqual(['10', '11', '1', '2', '3', '4']);

	const referenceSubscriptionOrder = events
		.filter(
			(event) =>
				event.type === FlowValueType.Subscribe &&
				event.connectLinesId.some(
					(connectLineId) =>
						connectLineId === ofEventLine.id || connectLineId === rangeEventLine.id,
				),
		)
		.map((event) => event.connectLinesId[0]);
	expect(referenceSubscriptionOrder).toEqual([rangeEventLine.id, ofEventLine.id]);
});
