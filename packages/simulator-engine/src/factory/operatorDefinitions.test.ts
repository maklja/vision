import { afterEach, describe, expect, it, vi } from 'vitest';
import { of, take, toArray } from 'rxjs';
import {
	Element,
	ConnectLine,
	ConnectPointType,
	ConnectPointPosition,
	DueDateType,
	fromOperatorDefinition,
	intervalOperatorDefinition,
	rangeOperatorDefinition,
	timerOperatorDefinition,
	ElementType,
	mapOperatorDefinition,
	ofOperatorDefinition,
	mapToOperatorPropsTemplate,
} from '@maklja/vision-simulator-model';
import { creationOperatorFactory } from './creationOperatorFactory';
import { joinCreationOperatorFactory } from './joinCreationOperatorFactory';
import { transformationOperatorFactory } from './transformationOperatorFactory';
import { filteringOperatorFactory } from './filteringOperatorFactory';
import { errorHandlingOperatorFactory } from './errorHandlingOperatorFactory';
import { FlowValue } from '../context';

function element(type: ElementType, properties = mapToOperatorPropsTemplate(type)): Element {
	return { id: 'operator', type, properties, name: type, x: 0, y: 0, visible: true };
}

const props = { refObservableGenerators: [] };

afterEach(() => vi.useRealTimers());

describe('operator metadata engine compatibility', () => {
	it('has exactly one execution registration for every executable current ElementType', () => {
		const factories = [
			creationOperatorFactory,
			joinCreationOperatorFactory,
			transformationOperatorFactory,
			filteringOperatorFactory,
			errorHandlingOperatorFactory,
		];
		const nonFactoryTypes = new Set([
			ElementType.Subscriber,
			ElementType.Result,
			ElementType.ConnectPoint,
		]);
		for (const type of Object.values(ElementType)) {
			const expected = nonFactoryTypes.has(type) ? 0 : 1;
			expect(
				factories.filter((factory) => factory.isSupported(element(type))),
				type,
			).toHaveLength(expected);
		}
	});

	it('runs the migrated Of defaults and preserves scalar-versus-array behavior', () => {
		const source = creationOperatorFactory.create(element(ofOperatorDefinition.type), props);
		const values: unknown[] = [];
		source().subscribe((value) => values.push(value.raw));
		expect(values).toEqual([1, 2, 3, 4]);
		const scalar: unknown[] = [];
		source({ argsFactoryExpression: 'function () { return { value: 7 }; }' }).subscribe(
			(value) => scalar.push(value.raw),
		);
		expect(scalar).toEqual([{ value: 7 }]);
	});

	it('preserves raw-value arguments, per-value index zero and FlowValue identity for Map', () => {
		const inputs = [1, 2, 3].map((value) =>
			FlowValue.createNextEvent({ elementId: 'source', value }),
		);
		const project = transformationOperatorFactory.create(
			element(mapOperatorDefinition.type, {
				projectExpression: 'function (value, index) { return [value * 10, index]; }',
			}),
			props,
		);
		let output: FlowValue[] = [];
		project(of(...inputs))
			.pipe(toArray())
			.subscribe((values) => {
				output = values;
			});
		expect(output.map((value) => value.raw)).toEqual([
			[10, 0],
			[20, 0],
			[30, 0],
		]);
		expect(output.map((value) => value.id)).toEqual(inputs.map((value) => value.id));
	});
});

describe('source metadata behavior compatibility', () => {
	it.each([
		{ properties: { start: 3 }, expected: [0, 1, 2] },
		{ properties: { start: 5, count: 0 }, expected: [] },
		{ properties: { start: 0, count: 3 }, expected: [0, 1, 2] },
		{ properties: { start: 5, count: 3 }, expected: [5, 6, 7] },
	])('keeps Range semantics for $properties', ({ properties, expected }) => {
		const source = creationOperatorFactory.create(
			element(rangeOperatorDefinition.type, properties),
			props,
		);
		const values: unknown[] = [];
		const complete = vi.fn();
		source(undefined, 'parent').subscribe({
			next: (value) => {
				values.push(value.raw);
				expect(value.elementId).toBe('operator');
				expect(value.subscribeId).toBe('parent');
			},
			complete,
		});
		expect(values).toEqual(expected);
		expect(complete).toHaveBeenCalledTimes(1);
	});

	it.each([1000, 50, 0])('preserves Interval period %i and invocation overrides', (period) => {
		vi.useFakeTimers();
		const model = element(intervalOperatorDefinition.type);
		const source = creationOperatorFactory.create(model, props);
		const values: unknown[] = [];
		const complete = vi.fn();
		source(period === 1000 ? undefined : { period }, 'parent')
			.pipe(take(3))
			.subscribe({
				next: (value) => {
					values.push(value.raw);
					expect(value.subscribeId).toBe('parent');
				},
				complete,
			});
		expect(values).toEqual([]);
		vi.runAllTimers();
		expect(values).toEqual([0, 1, 2]);
		expect(complete).toHaveBeenCalledTimes(1);
		expect(model.properties.period).toBe(1000);
		expect(vi.getTimerCount()).toBe(0);
	});

	it.each([
		{ mode: DueDateType.Milliseconds, due: 20, interval: -1, offset: 20, expected: [0] },
		{ mode: DueDateType.Date, due: 20, interval: -1, offset: 20, expected: [0] },
		{ mode: DueDateType.Date, due: -20, interval: -1, offset: 0, expected: [0] },
		{ mode: DueDateType.Milliseconds, due: 20, interval: 10, offset: 20, expected: [0, 1, 2] },
		{ mode: DueDateType.Milliseconds, due: 20, interval: 0, offset: 20, expected: [0, 1, 2] },
	])(
		'keeps Timer mode $mode / interval $interval / due $due',
		({ mode, due, interval, offset, expected }) => {
			vi.useFakeTimers();
			const now = Date.UTC(2026, 9, 16, 12);
			vi.setSystemTime(now);
			const model = element(timerOperatorDefinition.type);
			const source = creationOperatorFactory.create(model, props);
			const emissions: { value: unknown; at: number }[] = [];
			const complete = vi.fn();
			const startDue = mode === DueDateType.Date ? now + due : due;
			source({ dueDateType: mode, startDue, intervalDuration: interval }, 'parent')
				.pipe(take(3))
				.subscribe({
					next: (value) => {
						emissions.push({ value: value.raw, at: Date.now() - now });
						expect(value.subscribeId).toBe('parent');
					},
					complete,
				});
			expect(emissions).toEqual([]);
			vi.runAllTimers();
			expect(emissions.map((e) => e.value)).toEqual(expected);
			expect(emissions[0].at).toBe(offset);
			expect(complete).toHaveBeenCalledTimes(1);
			expect(model.properties).toEqual({
				dueDateType: 0,
				startDue: 1000,
				intervalDuration: -1,
			});
			expect(vi.getTimerCount()).toBe(0);
		},
	);

	it('uses only the input callback in From literal mode, with no arguments or connected helper', () => {
		const source = creationOperatorFactory.create(
			element(fromOperatorDefinition.type, {
				...fromOperatorDefinition.defaults,
				enableObservableEvent: false,
				inputCallbackExpression:
					'function input() { return [arguments.length, typeof createObservable]; }',
				observableFactory: 'this is deliberately invalid JavaScript',
			}),
			props,
		);
		const values: unknown[] = [];
		source(undefined, 'parent').subscribe((value) => {
			values.push(value.raw);
			expect(value.subscribeId).toBe('parent');
		});
		expect(values).toEqual([0, 'undefined']);
	});

	it('defers From connected invocation until subscription and preserves referenced FlowValues', () => {
		const referenceValues: FlowValue[] = [];
		const observableGenerator = vi.fn((_overrides, subscribeId) => {
			const value = FlowValue.createNextEvent({
				elementId: 'reference',
				value: 9,
				subscribeId,
			});
			referenceValues.push(value);
			return of(value);
		});
		const onSubscribe = vi.fn();
		const connectLine: ConnectLine = {
			id: 'reference-line',
			name: '',
			points: [],
			locked: false,
			index: 0,
			source: {
				id: 'operator',
				connectPointType: ConnectPointType.Event,
				connectPosition: ConnectPointPosition.Top,
			},
			target: {
				id: 'reference',
				connectPointType: ConnectPointType.Input,
				connectPosition: ConnectPointPosition.Left,
			},
		};
		const source = creationOperatorFactory.create(
			element(fromOperatorDefinition.type, {
				...fromOperatorDefinition.defaults,
				inputCallbackExpression: 'this is deliberately invalid JavaScript',
				observableFactory:
					'function input() { if (arguments.length) throw new Error("unexpected arguments"); return createObservable({period:25}); }',
			}),
			{
				refObservableGenerators: [
					{
						connectPoint: connectLine.source,
						connectLine,
						observableGenerator,
						onSubscribe,
					},
				],
			},
		);
		const observable = source(undefined, 'parent');
		expect(observableGenerator).not.toHaveBeenCalled();
		expect(onSubscribe).not.toHaveBeenCalled();
		const actual: FlowValue[] = [];
		observable.subscribe((value) => actual.push(value));
		observable.subscribe((value) => actual.push(value));
		expect(observableGenerator).toHaveBeenCalledTimes(2);
		expect(onSubscribe).toHaveBeenCalledTimes(2);
		for (let index = 0; index < 2; index++) {
			expect(actual[index]).toBe(referenceValues[index]);
			expect(observableGenerator.mock.calls[index]).toEqual([
				{ period: 25 },
				actual[index].subscribeId,
			]);
			expect(onSubscribe.mock.calls[index][0]).toMatchObject({
				subscribeId: 'parent',
				id: actual[index].subscribeId,
			});
		}
	});
});
