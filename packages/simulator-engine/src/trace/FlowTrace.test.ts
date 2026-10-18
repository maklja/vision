import { afterEach, describe, expect, it, vi } from 'vitest';
import { Observable, Subject, of, switchMap, take, tap } from 'rxjs';
import {
	ConnectLine,
	ConnectPointPosition as Position,
	ConnectPointType as PointType,
	Element,
	ElementProps,
	ElementType as Type,
	FlowValueType,
} from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from '../ObservableSimulation';
import { FlowValue, FlowValueEvent } from '../context';
import { FlowTrace, FlowTraceEvent, isFlowTraceEvent } from './FlowTrace';

function element(id: string, type: Type, properties: ElementProps = {}): Element {
	return { id, type, name: id, x: 0, y: 0, visible: true, properties };
}
function line(
	source: string,
	target: string,
	reference = false,
	index = 0,
	position = Position.Top,
): ConnectLine {
	return {
		id: `${source}-${target}-${index}`,
		name: `${index}`,
		index,
		locked: false,
		points: [],
		source: {
			id: source,
			connectPointType: reference ? PointType.Event : PointType.Output,
			connectPosition: reference ? position : Position.Right,
		},
		target: { id: target, connectPointType: PointType.Input, connectPosition: Position.Left },
	};
}
const sink = element('sink', Type.Subscriber);
function execute(elements: Element[], lines: ConnectLine[], entry = elements[0].id) {
	const events: FlowTraceEvent[] = [],
		values: FlowValueEvent[] = [];
	const complete = vi.fn(),
		error = vi.fn();
	const simulation = new ObservableSimulation(
		createSimulationModel(entry, [...elements, sink], lines),
		{},
		undefined,
		'test-run',
		{
			clock: () => 50,
			onTrace: (event) => {
				expect(isFlowTraceEvent(event)).toBe(true);
				events.push(structuredClone(event));
			},
		},
	);
	const subscription = simulation.start({ next: (value) => values.push(value), complete, error });
	return { events, values, complete, error, subscription };
}
function verify(events: FlowTraceEvent[]) {
	const open = new Map<string, string>();
	events.forEach((event, i) => {
		expect(event).toMatchObject({
			version: 1,
			runId: 'test-run',
			seq: i + 1,
			timeMs: 0,
			eventId: `test-run:event:${i + 1}`,
		});
		expect(new Set(event.dependencies).size).toBe(event.dependencies.length);
		if ('subscriptionId' in event) {
			if (event.kind === 'subscribe') {
				expect(open.has(event.subscriptionId)).toBe(false);
				if (event.parentSubscriptionId)
					expect(open.has(event.parentSubscriptionId)).toBe(true);
				open.set(event.subscriptionId, 'open');
			} else {
				expect(open.has(event.subscriptionId)).toBe(true);
				if (event.kind !== 'unsubscribe')
					expect(open.get(event.subscriptionId)).toBe('open');
				if (event.kind === 'complete' || event.kind === 'error')
					open.set(event.subscriptionId, event.kind);
				if (event.kind === 'unsubscribe') open.delete(event.subscriptionId);
			}
		}
	});
	expect(open.size).toBe(0);
	expect(events.at(-1)?.kind).toBe('run-ended');
}
afterEach(() => vi.useRealTimers());

describe('protocol v1 graph traces', () => {
	it('T1 preserves logical identity through map with separate paths/record identities', () => {
		const result = execute(
			[
				element('source', Type.Of, { argsFactoryExpression: '() => [1]' }),
				element('map', Type.Map, { projectExpression: 'x => x + 1' }),
			],
			[line('source', 'map'), line('map', 'sink')],
		);
		expect(result.events.map((e) => e.kind)).toEqual([
			'subscribe',
			'next',
			'next',
			'complete',
			'unsubscribe',
			'run-ended',
		]);
		const next = result.events.filter((e) => e.kind === 'next');
		expect(next.map((e) => e.value)).toEqual(['1', '2']);
		expect(next[0].valueId).toBe(next[1].valueId);
		expect(next.map((e) => e.path)).toEqual([['source-map-0'], ['map-sink-0']]);
		expect(result.values.every((e) => e.subscribeId === null)).toBe(true);
		expect(result.complete).toHaveBeenCalledOnce();
		verify(result.events);
	});
	it('T1 EMPTY completes and tears down without inventing a value', () => {
		const result = execute([element('empty', Type.Empty)], [line('empty', 'sink')]);
		expect(result.events.map((e) => e.kind)).toEqual([
			'subscribe',
			'complete',
			'unsubscribe',
			'run-ended',
		]);
		expect(result.values).toEqual([]);
		verify(result.events);
	});
	it('T2 aggregates fresh lineage and both input dependencies', () => {
		const result = execute(
			[
				element('join', Type.CombineLatest, { observableInputsType: 'array' }),
				element('a', Type.Of, { argsFactoryExpression: '() => [1]' }),
				element('b', Type.Of, { argsFactoryExpression: '() => [2]' }),
			],
			[
				line('join', 'sink'),
				line('join', 'a', true, 0),
				line('join', 'b', true, 1),
				line('a', 'sink'),
				line('b', 'sink'),
			],
		);
		const next = result.events.filter((e) => e.kind === 'next');
		const aggregate = next.find((e) => e.elementId === 'join')!;
		expect(aggregate.value).toBe('1,2');
		expect(aggregate.dependencies).toHaveLength(2);
		expect(aggregate.dependencies).not.toContain(aggregate.valueId);
		for (const id of aggregate.dependencies)
			expect(next.some((e) => e.valueId === id)).toBe(true);
		expect(result.events.filter((e) => e.kind === 'subscribe')).toHaveLength(3);
		verify(result.events);
	});
	it.each([Type.Concat, Type.Merge])(
		'T2/T7 %s independently subscribes twice to the same cold node',
		(type) => {
			const result = execute(
				[
					element('join', type, type === Type.Merge ? { limitConcurrent: 0 } : {}),
					element('a', Type.Of, { argsFactoryExpression: '() => [1]' }),
				],
				[
					line('join', 'sink'),
					line('join', 'a', true, 0),
					line('join', 'a', true, 1),
					line('a', 'sink'),
				],
			);
			const children = result.events
				.filter((e) => e.kind === 'subscribe')
				.filter((e) => e.elementId === 'a');
			expect(children).toHaveLength(2);
			expect(children[0].subscriptionId).not.toBe(children[1].subscriptionId);
			expect(children[0].parentSubscriptionId).toBe(children[1].parentSubscriptionId);
			expect(children.map((e) => e.referenceLineId)).toEqual(['join-a-0', 'join-a-1']);
			if (type === Type.Concat)
				expect(
					result.events.findIndex(
						(e) =>
							e.kind === 'unsubscribe' &&
							e.subscriptionId === children[0].subscriptionId,
					),
				).toBeLessThan(result.events.indexOf(children[1]));
			verify(result.events);
		},
	);
	it('T2 race cancels an observed loser without completing it', () => {
		vi.useFakeTimers();
		const result = execute(
			[
				element('race', Type.Race),
				element('a', Type.Timer, { startDue: 10, intervalDuration: -1 }),
				element('b', Type.Timer, { startDue: 20, intervalDuration: -1 }),
			],
			[
				line('race', 'sink'),
				line('race', 'a', true),
				line('race', 'b', true, 1),
				line('a', 'sink'),
				line('b', 'sink'),
			],
		);
		vi.advanceTimersByTime(30);
		const loser = result.events.find((e) => e.kind === 'subscribe' && e.elementId === 'b')!;
		expect(
			result.events.find(
				(e) =>
					e.kind === 'unsubscribe' &&
					e.subscriptionId === ('subscriptionId' in loser && loser.subscriptionId),
			),
		).toMatchObject({ reason: 'operator-cancel', cancellingElementId: 'race' });
		expect(result.events.some((e) => e.kind === 'complete' && e.elementId === 'b')).toBe(false);
		verify(result.events);
	});
	it('T2 synchronous race never subscribes an unneeded input', () => {
		const result = execute(
			[
				element('race', Type.Race),
				element('a', Type.Of, { argsFactoryExpression: '() => [1]' }),
				element('b', Type.Of, {
					argsFactoryExpression: '() => { throw new Error("unselected"); }',
				}),
			],
			[
				line('race', 'sink'),
				line('race', 'a', true),
				line('race', 'b', true, 1),
				line('a', 'sink'),
				line('b', 'sink'),
			],
		);
		expect(result.events.some((e) => e.kind === 'subscribe' && e.elementId === 'b')).toBe(
			false,
		);
		expect(result.error).not.toHaveBeenCalled();
		verify(result.events);
	});
	it('T4 caught child failure ends only the child; recovery has new lineage', () => {
		const result = execute(
			[
				element('root', Type.Defer, { observableFactory: '() => createObservable()' }),
				element('fail', Type.ThrowError, {
					errorOrErrorFactory: '() => new Error("private payload")',
				}),
				element('catch', Type.CatchError, {
					selectorExpression: '() => createObservable()',
				}),
				element('recovery', Type.Of, { argsFactoryExpression: '() => [9]' }),
			],
			[
				line('root', 'catch'),
				line('root', 'fail', true),
				line('fail', 'sink'),
				line('catch', 'sink'),
				line('catch', 'recovery', true),
				line('recovery', 'sink'),
			],
		);
		const error = result.events.find((e) => e.kind === 'error')!;
		expect(error).toMatchObject({ elementId: 'fail', kind: 'error' });
		expect(JSON.stringify(result.events)).not.toContain('private payload');
		expect(result.error).not.toHaveBeenCalled();
		expect(result.complete).toHaveBeenCalledOnce();
		expect(result.events.at(-1)).toMatchObject({ reason: 'completed' });
		verify(result.events);
	});
	it('T4 uncaught failure retains triggering lineage, field and occurrence diagnostics', () => {
		const result = execute(
			[
				element('source', Type.Of, { argsFactoryExpression: '() => [1]' }),
				element('map', Type.Map, {
					projectExpression: '() => { throw new Error("secret"); }',
				}),
			],
			[line('source', 'map'), line('map', 'sink')],
		);
		const next = result.events.find((e) => e.kind === 'next')!;
		expect(result.events.find((e) => e.kind === 'error')).toMatchObject({
			elementId: 'map',
			dependencies: ['valueId' in next && next.valueId],
			path: ['map-sink-0'],
		});
		const diagnostic = result.events.find((e) => e.kind === 'diagnostic');
		expect(diagnostic).toMatchObject({
			diagnostic: {
				elementId: 'map',
				field: 'projectExpression',
				subscriptionId: expect.any(String),
			},
		});
		expect(result.error).toHaveBeenCalledOnce();
		expect(result.complete).not.toHaveBeenCalled();
		verify(result.events);
	});
	it('T6 stop is idempotent, tears down once, and never fabricates complete', () => {
		vi.useFakeTimers();
		const result = execute(
			[element('source', Type.Interval, { period: 10 })],
			[line('source', 'sink')],
		);
		vi.advanceTimersByTime(20);
		result.subscription.unsubscribe();
		result.subscription.unsubscribe();
		vi.advanceTimersByTime(100);
		expect(result.events.map((e) => e.kind)).toEqual([
			'subscribe',
			'next',
			'next',
			'unsubscribe',
			'run-ended',
		]);
		expect(result.events.at(-2)).toMatchObject({ reason: 'run-stop' });
		expect(result.events.at(-1)).toMatchObject({
			reason: 'cancelled',
			teardownConfirmed: true,
		});
		expect(result.complete).not.toHaveBeenCalled();
		verify(result.events);
	});
	it('T7 IIf only invokes the selected reference', () => {
		const result = execute(
			[
				element('root', Type.IIf, {
					conditionExpression: '() => true',
					trueCallbackExpression: '() => createObservable()',
					falseCallbackExpression: '() => createObservable()',
				}),
				element('chosen', Type.Empty),
				element('other', Type.Of, {
					argsFactoryExpression: '() => { throw new Error("unselected"); }',
				}),
			],
			[
				line('root', 'sink'),
				line('root', 'chosen', true),
				line('root', 'other', true, 1, Position.Bottom),
				line('chosen', 'sink'),
				line('other', 'sink'),
			],
		);
		expect(result.events.filter((e) => e.kind === 'subscribe').map((e) => e.elementId)).toEqual(
			['root', 'chosen'],
		);
		verify(result.events);
	});
	it('T8 observes a synchronous burst larger than the former replay buffer', () => {
		const result = execute(
			[element('source', Type.Range, { start: 0, count: 10020 })],
			[line('source', 'sink')],
		);
		expect(result.values).toHaveLength(10020);
		expect(result.values[0].value).toBe('0');
		expect(result.values.at(-1)?.value).toBe('10019');
		verify(result.events);
	});
});

it('T3 protocol fixture observes switch cancellation and take cancellation without fake completion', () => {
	const events: FlowTraceEvent[] = [];
	const trace = new FlowTrace('test-run', { clock: () => 0, onTrace: (e) => events.push(e) });
	const outer = new Subject<FlowValue>();
	const inners: Subject<FlowValue>[] = [];
	const root = trace.observe('root', undefined, (id) =>
		outer.pipe(
			tap((value) => trace.notification(id, value, [])),
			switchMap(() =>
				trace.observe(
					'inner',
					{
						parentSubscriptionId: id,
						referenceLineId: 'ref',
						cancellationElementId: 'switch',
					},
					() => {
						const inner = new Subject<FlowValue>();
						inners.push(inner);
						return inner;
					},
				),
			),
		),
	);
	root.subscribe();
	outer.next(FlowValue.createNextEvent({ value: 'A', elementId: 'root' }));
	outer.next(FlowValue.createNextEvent({ value: 'B', elementId: 'root' }));
	inners[1].complete();
	outer.complete();
	const subscriptions = events.filter((e) => e.kind === 'subscribe');
	expect(
		events.find(
			(e) => e.kind === 'unsubscribe' && e.subscriptionId === subscriptions[1].subscriptionId,
		),
	).toMatchObject({ reason: 'operator-cancel' });
	verify(events);
	const takeEvents: FlowTraceEvent[] = [];
	const taken = new FlowTrace('take', { onTrace: (e) => takeEvents.push(e) });
	taken
		.observe('source', undefined, () =>
			of(
				FlowValue.createNextEvent({ value: 1, elementId: 'source' }),
				FlowValue.createNextEvent({ value: 2, elementId: 'source' }),
			),
		)
		.pipe(take(1))
		.subscribe();
	expect(takeEvents.map((e) => e.kind)).toEqual(['subscribe', 'unsubscribe', 'run-ended']);
	expect(takeEvents.at(-2)).toMatchObject({ reason: 'consumer-unsubscribe' });
});
it('keeps FlowValue.copy identity and deduplicates aggregation dependencies', () => {
	const value = new FlowValue(1, 'source', FlowValueType.Next, 'value', null, ['a', 'a']);
	expect(value.copy(2).id).toBe(value.id);
	expect(value.copy(2).dependencies).toEqual(['a']);
});

it('records observed teardown and run end only after synchronous source cleanup', () => {
	const order: string[] = [];
	const trace = new FlowTrace('cleanup', {
		onTrace: (e) => {
			if (e.kind === 'unsubscribe' || e.kind === 'run-ended') order.push(e.kind);
		},
	});
	trace
		.observe(
			'source',
			undefined,
			() =>
				new Observable<FlowValue>((observer) => {
					observer.complete();
					return () => order.push('source cleanup');
				}),
		)
		.subscribe();
	expect(order).toEqual(['source cleanup', 'unsubscribe', 'run-ended']);
});

it('T7 concurrent mergeMap occurrences finish independently and retain their parent', () => {
	vi.useFakeTimers();
	const result = execute(
		[
			element('outer', Type.Of, { argsFactoryExpression: '() => [1, 2]' }),
			element('project', Type.MergeMap, {
				projectExpression: 'value => createObservable({startDue: value * 10})',
				concurrent: 2,
			}),
			element('inner', Type.Timer, { startDue: 1, intervalDuration: -1 }),
		],
		[
			line('outer', 'project'),
			line('project', 'sink'),
			line('project', 'inner', true),
			line('inner', 'sink'),
		],
	);
	const children = result.events
		.filter((e) => e.kind === 'subscribe')
		.filter((e) => e.elementId === 'inner');
	expect(children).toHaveLength(2);
	expect(children[0].subscriptionId).not.toBe(children[1].subscriptionId);
	expect(children[0].parentSubscriptionId).toBe(children[1].parentSubscriptionId);
	vi.advanceTimersByTime(10);
	expect(result.events.filter((e) => e.kind === 'unsubscribe')).toHaveLength(1);
	expect(result.events.some((e) => e.kind === 'run-ended')).toBe(false);
	expect(result.complete).not.toHaveBeenCalled();
	vi.advanceTimersByTime(10);
	expect(result.complete).toHaveBeenCalledOnce();
	verify(result.events);
});
it('correlates parameter evaluation diagnostics to the actual child occurrence', () => {
	const result = execute(
		[
			element('outer', Type.Defer, { observableFactory: '() => createObservable()' }),
			element('inner', Type.Range, {
				start: 0,
				count: { kind: 'expression', type: 'number', source: '"bad"' },
			}),
		],
		[line('outer', 'sink'), line('outer', 'inner', true), line('inner', 'sink')],
	);
	const child = result.events
		.filter((e) => e.kind === 'subscribe')
		.find((e) => e.elementId === 'inner')!;
	expect(result.events.find((e) => e.kind === 'diagnostic')).toMatchObject({
		diagnostic: {
			category: 'result',
			field: 'count',
			elementId: 'inner',
			subscriptionId: child.subscriptionId,
		},
	});
	expect(result.error).toHaveBeenCalledOnce();
	verify(result.events);
});
it('clamps a backwards injected clock and permits equal timestamps', () => {
	let now = 100;
	const events: FlowTraceEvent[] = [];
	const trace = new FlowTrace('clock', { clock: () => now, onTrace: (e) => events.push(e) });
	const source = new Subject<FlowValue>();
	trace.observe('source', undefined, () => source).subscribe();
	now = 110;
	source.complete();
	now = 105;
	expect(events.map((e) => e.timeMs)).toEqual([0, 10, 10, 10]);
});
it('allocates fresh run and subscription identities when a simulation instance restarts', () => {
	const events: FlowTraceEvent[] = [];
	const source = element('source', Type.Empty);
	const simulation = new ObservableSimulation(
		createSimulationModel('source', [source, sink], [line('source', 'sink')]),
		{},
		undefined,
		undefined,
		{ onTrace: (e) => events.push(e) },
	);
	simulation.start({});
	simulation.stop();
	simulation.start({});
	const starts = events.filter((e) => e.kind === 'subscribe');
	expect(starts).toHaveLength(2);
	expect(starts[0].runId).not.toBe(starts[1].runId);
	expect(starts[0].subscriptionId).not.toBe(starts[1].subscriptionId);
	expect(starts.map((e) => e.seq)).toEqual([1, 1]);
});

it('does not execute a captured reference after its invoking run has ended', () => {
	const events: FlowTraceEvent[] = [];
	const build = vi.fn(() => of(FlowValue.createNextEvent({ value: 1, elementId: 'late' })));
	const trace = new FlowTrace('late', { onTrace: (e) => events.push(e) });
	let parent = '';
	trace
		.observe('root', undefined, (id) => {
			parent = id;
			return of();
		})
		.subscribe();
	const count = events.length;
	const error = vi.fn();
	trace
		.observe('late', { parentSubscriptionId: parent, referenceLineId: 'ref' }, build)
		.subscribe({ error });
	expect(build).not.toHaveBeenCalled();
	expect(error).toHaveBeenCalledOnce();
	expect(events).toHaveLength(count);
});
