import { describe, expect, it, vi } from 'vitest';
import { lastValueFrom, of, toArray } from 'rxjs';
import {
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
	mapToOperatorPropsTemplate,
} from '@maklja/vision-simulator-model';
import { creationOperatorFactory } from '../factory/creationOperatorFactory';
import { transformationOperatorFactory } from '../factory/transformationOperatorFactory';
import { FlowValue } from '../context';
import { cloneContextSeed, ExecutionRun, preflight } from './ExecutionRun';

function element(type: ElementType, properties: ElementProps = {}): Element {
	return {
		id: type,
		type,
		name: type,
		x: 0,
		y: 0,
		visible: true,
		properties: { ...mapToOperatorPropsTemplate(type), ...properties },
	};
}
function reference(run: ExecutionRun, child: Element) {
	const source = {
		id: 'parent',
		connectPointType: ConnectPointType.Event,
		connectPosition: ConnectPointPosition.Top,
	};
	return {
		connectPoint: source,
		observableGenerator: creationOperatorFactory.create(child, {
			run,
			refObservableGenerators: [],
		}),
		connectLine: {
			id: 'line',
			name: '',
			source,
			target: { ...source, id: child.id, connectPointType: ConnectPointType.Input },
			points: [],
			index: 0,
			locked: false,
		},
	};
}
const value = (raw: unknown) => FlowValue.createNextEvent({ elementId: 'outer', value: raw });

describe('run-scoped trusted callbacks', () => {
	it('shares mutable context within a run and resets it across simultaneous runs and restarts', () => {
		const seed = { seen: 0, nested: { value: 1 } };
		const a = new ExecutionRun('a', seed),
			b = new ExecutionRun('b', seed);
		const el = element(ElementType.Map, {
			projectExpression: 'value => ++$context.seen + value',
		});
		const values: unknown[] = [];
		for (const run of [a, a, b, new ExecutionRun('restart', seed)]) {
			transformationOperatorFactory
				.create(el, { run, refObservableGenerators: [] })(of(value(10)))
				.subscribe((v) => values.push(v.raw));
		}
		expect(values).toEqual([11, 12, 11, 11]);
		expect(seed).toEqual({ seen: 0, nested: { value: 1 } });
	});
	it('freezes isolated params for each cold subscription', () => {
		const run = new ExecutionRun();
		const source = creationOperatorFactory.create(
			element(ElementType.Of, { argsFactoryExpression: '() => [$params]' }),
			{ run, refObservableGenerators: [] },
		)();
		const snapshots: ElementProps[] = [];
		source.subscribe((v) => snapshots.push(v.raw as ElementProps));
		source.subscribe((v) => snapshots.push(v.raw as ElementProps));
		expect(snapshots[0]).not.toBe(snapshots[1]);
		expect(Object.isFrozen(snapshots[0])).toBe(true);
		expect(() => {
			snapshots[0].extra = 1;
		}).toThrow();
	});
	it.each([ElementType.MergeMap, ElementType.ConcatMap])(
		'isolates %s inner overrides and waits for actual subscription',
		async (type) => {
			const run = new ExecutionRun('inners', { subscribed: 0 });
			const child = element(ElementType.From, {
				enableObservableEvent: false,
				inputCallbackExpression:
					'() => { $context.subscribed++; return new Promise(resolve => setTimeout(() => resolve(JSON.parse($params.observableFactory)), 10)); }',
			});
			const operator = transformationOperatorFactory.create(
				element(type, {
					projectExpression:
						'(raw, index) => createObservable({ observableFactory: JSON.stringify(raw + 1) })',
				}),
				{ run, refObservableGenerators: [reference(run, child)] },
			);
			const observable = operator(of(value(1), value(2)));
			expect(run.context.subscribed).toBe(0);
			const pending = lastValueFrom(observable.pipe(toArray()));
			expect(run.context.subscribed).toBe(type === ElementType.ConcatMap ? 1 : 2);
			const results = await pending;
			expect(results.map((v) => v.raw)).toEqual([2, 3]);
			expect(run.context.subscribed).toBe(2);
			expect(child.properties.observableFactory).not.toBe('[3]');
		},
	);
	it.each([undefined, null, '0', NaN])('rejects explicit invalid range override %s', (start) => {
		const error = vi.fn();
		creationOperatorFactory
			.create(element(ElementType.Range), { refObservableGenerators: [] })({ start })
			.subscribe({ error });
		expect(error.mock.calls[0][0].diagnostic).toMatchObject({
			category: 'schema',
			field: 'start',
		});
	});
	it('preserves zero overrides, absent optional count, false and empty string values', () => {
		const run = new ExecutionRun();
		expect(
			run.resolve(element(ElementType.Range, { start: 4 }), { start: 0, count: 0 })
				.properties,
		).toMatchObject({ start: 0, count: 0 });
		const range = element(ElementType.Range);
		delete range.properties.count;
		expect(run.resolve(range).properties).not.toHaveProperty('count');
		expect(
			run.resolve(element(ElementType.From), { enableObservableEvent: false }).properties
				.enableObservableEvent,
		).toBe(false);
		expect(run.resolve(element(ElementType.Ajax), { url: '' }).properties.url).toBe('');
	});
	it('preflights without evaluating malicious callback-producing expressions', () => {
		const source = element(ElementType.Of, {
			argsFactoryExpression: '(() => { throw new Error("host code executed"); })()',
		});
		expect(() => preflight([source])).not.toThrow();
		expect(() => preflight([element(ElementType.Map, { projectExpression: '42' })])).toThrow();
		expect(() =>
			preflight([element(ElementType.Map, { projectExpression: '() =>' })]),
		).toThrow();
	});
	it('attributes result errors and preserves authored runtime errors as catchable exceptions', () => {
		const report = vi.fn(),
			run = new ExecutionRun('errors', {}, report);
		const bad = run.resolve(element(ElementType.From, { inputCallbackExpression: '() => 42' }));
		expect(() => run.callback(bad, 'inputCallbackExpression')()).toThrow();
		expect(report.mock.calls[0][0]).toMatchObject({
			runId: 'errors',
			field: 'inputCallbackExpression',
			category: 'result',
		});
		const throwing = run.resolve(
			element(ElementType.Map, {
				projectExpression: '() => { throw new Error("authored"); }',
			}),
		);
		expect(() => run.callback(throwing, 'projectExpression')()).toThrow('authored');
	});
	it('rejects unsafe keys, oversized data, cycles, class values and accessors without invoking them', () => {
		const getter = vi.fn();
		const seed = Object.defineProperty({}, 'value', { get: getter, enumerable: true });
		for (const invalid of [
			seed,
			new Date(),
			{ x: Infinity },
			{ text: 'x'.repeat(1024 * 1024) },
			JSON.parse('{"__proto__":{}}'),
		])
			expect(() => cloneContextSeed(invalid)).toThrow();
		expect(getter).not.toHaveBeenCalled();
		const cyclic: ElementProps = {};
		cyclic.self = cyclic;
		expect(() => cloneContextSeed(cyclic)).toThrow();
	});
});
