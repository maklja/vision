import { describe, expect, it, vi, afterEach } from 'vitest';
import { of, lastValueFrom, toArray } from 'rxjs';
import {
	Element,
	ElementType,
	ElementProps,
	mapToOperatorPropsTemplate,
} from '@maklja/vision-simulator-model';
import { ExecutionRun, preflight, requiresTrustedWorker } from './ExecutionRun';
import { creationOperatorFactory } from '../factory/creationOperatorFactory';

const literal = (value: number, type = 'number') => ({ kind: 'literal', type, value });
const expression = (source: string, type = 'number') => ({ kind: 'expression', type, source });
const element = (type: ElementType, properties: ElementProps): Element => ({
	id: 'source',
	type,
	name: 'Source',
	x: 0,
	y: 0,
	visible: true,
	properties: { ...mapToOperatorPropsTemplate(type), ...properties },
});
afterEach(() => vi.useRealTimers());

describe('typed source subscription parameters', () => {
	it('reevaluates on actual cold subscription, never during preflight or factory creation', () => {
		const run = new ExecutionRun('cold', { calls: 0 });
		const el = element(ElementType.Range, {
			start: expression('++$context.calls'),
			count: literal(1),
		});
		preflight([el]);
		const source = creationOperatorFactory.create(el, { run, refObservableGenerators: [] })();
		expect(run.context.calls).toBe(0);
		const values: unknown[] = [];
		source.subscribe((v) => values.push(v.raw));
		source.subscribe((v) => values.push(v.raw));
		expect(values).toEqual([1, 2]);
		expect(el.properties.start).toEqual(expression('++$context.calls'));
	});
	it('freezes raw definitions for every expression and uses direct overrides without evaluating saved source', () => {
		const run = new ExecutionRun('raw', { touched: 0 });
		const el = element(ElementType.Range, {
			start: expression('($context.touched++, 10)'),
			count: expression(
				'$params.start.kind === "expression" && Object.isFrozen($params.start) ? 1 : 100',
			),
		});
		expect(run.resolve(el).properties).toEqual({ start: 10, count: 1 });
		expect(run.resolve(el, { start: 0, count: 0 }).properties).toEqual({ start: 0, count: 0 });
		expect(run.context.touched).toBe(1);
		expect(() => run.resolve(el, { count: literal(1) })).toThrow();
	});
	it('preserves missing Range count and rejects undefined/null, unknown and unsafe override keys', () => {
		const run = new ExecutionRun();
		const el = element(ElementType.Range, { start: literal(2) });
		delete el.properties.count;
		expect(run.resolve(el).properties).toEqual({ start: 2 });
		for (const overrides of [
			{ count: undefined },
			{ count: null },
			{ unknown: 1 },
			JSON.parse('{"__proto__":1}'),
		])
			expect(() => run.resolve(el, overrides)).toThrow();
	});
	it.each(['"2"', 'undefined', 'null', 'NaN', 'Infinity', '1.5', '-1', '$context.missing'])(
		'attributes invalid count result %s to the field',
		(source) => {
			const run = new ExecutionRun('typed');
			expect(() =>
				run.resolve(element(ElementType.Range, { count: expression(source) })),
			).toThrowError(
				expect.objectContaining({
					diagnostic: expect.objectContaining({
						category: 'result',
						elementId: 'source',
						field: 'count',
						runId: 'typed',
					}),
				}),
			);
		},
	);
	it('attributes expression exceptions and syntax errors separately, without host execution', () => {
		const run = new ExecutionRun('errors');
		const el = element(ElementType.Range, { start: expression('$context.missing.value') });
		expect(() => preflight([el])).not.toThrow();
		expect(() => run.resolve(el)).toThrowError(
			expect.objectContaining({
				diagnostic: expect.objectContaining({ category: 'invocation', field: 'start' }),
			}),
		);
		el.properties.start = expression('() =>');
		expect(() => preflight([el])).toThrowError(
			expect.objectContaining({
				diagnostic: expect.objectContaining({ category: 'compile', field: 'start' }),
			}),
		);
	});
	it('classifies parameter expressions as trusted execution and wrapped literals as safe', () => {
		expect(
			requiresTrustedWorker([
				element(ElementType.Range, { start: literal(0), count: literal(1) }),
			]),
		).toBe(false);
		expect(
			requiresTrustedWorker([element(ElementType.Interval, { period: expression('1000') })]),
		).toBe(true);
	});
	it('preserves zero scheduling, past epoch dates and the one-shot sentinel', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(1000);
		const run = new ExecutionRun('timers');
		const el = element(ElementType.Timer, {
			dueDateType: 1,
			startDue: expression('0', 'date'),
			intervalDuration: literal(-1),
		});
		const events = lastValueFrom(
			creationOperatorFactory
				.create(el, { run, refObservableGenerators: [] })()
				.pipe(toArray()),
		);
		await vi.runAllTimersAsync();
		expect((await events).map((v) => v.raw)).toEqual([0]);
		expect(
			run.resolve(element(ElementType.Interval, { period: expression('0') })).properties
				.period,
		).toBe(0);
	});
	it('keeps subscription errors catchable in RxJS', async () => {
		const { catchError } = await import('rxjs');
		const source = creationOperatorFactory.create(
			element(ElementType.Range, { count: expression('"bad"') }),
			{ run: new ExecutionRun(), refObservableGenerators: [] },
		)();
		expect(await lastValueFrom(source.pipe(catchError(() => of('caught'))))).toBe('caught');
	});
});

import { delay } from 'rxjs';
import { ConnectPointType, ConnectPointPosition } from '@maklja/vision-simulator-model';
import { transformationOperatorFactory } from '../factory/transformationOperatorFactory';
import { FlowValue } from '../context';

it.each([ElementType.ConcatMap, ElementType.MergeMap])(
	'resolves %s typed inners at subscription time and isolates direct overrides',
	async (type) => {
		vi.useFakeTimers();
		const run = new ExecutionRun('inners', { calls: 0 });
		const child = element(ElementType.Range, {
			start: literal(99),
			count: expression(
				'($context.calls++, Object.isFrozen($params) && $params.start < 3 ? 1 : 0)',
			),
		});
		const generator = creationOperatorFactory.create(child, {
			run,
			refObservableGenerators: [],
		});
		const point = {
			id: 'outer',
			connectPointType: ConnectPointType.Event,
			connectPosition: ConnectPointPosition.Top,
		};
		const operator = transformationOperatorFactory.create(
			element(type, { projectExpression: 'raw => createObservable({ start: raw })' }),
			{
				run,
				refObservableGenerators: [
					{
						connectPoint: point,
						connectLine: {
							id: 'ref',
							source: point,
							target: {
								...point,
								id: child.id,
								connectPointType: ConnectPointType.Input,
								connectPosition: ConnectPointPosition.Left,
							},
							points: [],
							index: 0,
							name: '',
							locked: false,
						},
						observableGenerator: (overrides, subscription) =>
							generator(overrides, subscription).pipe(delay(10)),
					},
				],
			},
		);
		const stream = operator(
			of(
				...[1, 2].map((raw) =>
					FlowValue.createNextEvent({ elementId: 'outer', value: raw }),
				),
			),
		);
		expect(run.context.calls).toBe(0);
		const result = lastValueFrom(stream.pipe(toArray()));
		expect(run.context.calls).toBe(type === ElementType.ConcatMap ? 1 : 2);
		await vi.runAllTimersAsync();
		expect((await result).map((v) => v.raw)).toEqual([1, 2]);
		expect(run.context.calls).toBe(2);
		expect(child.properties.start).toEqual(literal(99));
	},
);

it('rejects oversized snapshots, accessor/prototype data and excessive depth before dispatch', () => {
	const getter = vi.fn(() => literal(1));
	const el = element(ElementType.Range, {});
	Object.defineProperty(el.properties, 'count', { enumerable: true, get: getter });
	expect(() => preflight([el])).toThrow();
	expect(getter).not.toHaveBeenCalled();
	const oversized = element(ElementType.Of, {
		argsFactoryExpression: '() => []',
		observableFactory: 'x'.repeat(1024 * 1024),
	});
	expect(() => preflight([oversized])).toThrow();
	const run = new ExecutionRun();
	let deep: unknown = {};
	for (let i = 0; i < 65; i++) deep = { value: deep };
	expect(() => run.resolve(element(ElementType.Range, {}), { start: deep })).toThrow();
});
