import { describe, expect, it, vi } from 'vitest';
import { take } from 'rxjs';
import {
	Element,
	ElementProps,
	emptyOperatorDefinition,
	generateOperatorDefinition,
	throwErrorOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { creationOperatorFactory } from './creationOperatorFactory';

function element(
	definition:
		| typeof emptyOperatorDefinition
		| typeof generateOperatorDefinition
		| typeof throwErrorOperatorDefinition,
	properties: ElementProps = definition.defaults,
): Element {
	return {
		id: 'source',
		type: definition.type,
		name: definition.name,
		x: 0,
		y: 0,
		visible: true,
		properties,
	};
}
const factory = (definition: Parameters<typeof element>[0], properties?: ElementProps) =>
	creationOperatorFactory.create(element(definition, properties), {
		refObservableGenerators: [],
	});

describe('generation operator metadata compatibility', () => {
	it('Empty ignores overrides and completes without values on each subscription', () => {
		const observable = factory(emptyOperatorDefinition)(
			{ unused: '(() => { throw new Error("unused"); })()' },
			'parent',
		);
		const next = vi.fn(),
			complete = vi.fn();
		observable.subscribe({ next, complete });
		observable.subscribe({ next, complete });
		expect(next).not.toHaveBeenCalled();
		expect(complete).toHaveBeenCalledTimes(2);
	});
	it('Generate preserves default results and creates fresh FlowValues per subscription', () => {
		const observable = factory(generateOperatorDefinition)(undefined, 'parent');
		const actual: FlowValue[] = [];
		observable.subscribe((v) => actual.push(v));
		observable.subscribe((v) => actual.push(v));
		expect(actual.map((v) => v.raw)).toEqual([0, 1000, 2000, 0, 1000, 2000]);
		expect(new Set(actual.map((v) => v.id)).size).toBe(6);
		actual.forEach((v) =>
			expect(v).toMatchObject({
				elementId: 'source',
				subscribeId: 'parent',
				dependencies: [],
			}),
		);
	});
	it('Generate evaluates state and callbacks at invocation, then passes state without an index/helper', () => {
		const properties = {
			...generateOperatorDefinition.defaults,
			initialState: '(() => { throw new Error("stored state"); })()',
		};
		const source = factory(generateOperatorDefinition, properties);
		const overrides = {
			initialState: '({n:1})',
			condition:
				'function condition(state) { if (arguments.length !== 1 || typeof createObservable !== "undefined") throw new Error("condition arguments"); return state.n < 3; }',
			iterate:
				'function iterate(state) { if (arguments.length !== 1 || typeof createObservable !== "undefined") throw new Error("iterate arguments"); return {n:state.n + 1}; }',
			resultSelector:
				'function resultSelector(state) { if (arguments.length !== 1 || typeof createObservable !== "undefined") throw new Error("selector arguments"); return state.n * 10; }',
		};
		const actual: unknown[] = [];
		source(overrides).subscribe((v) => actual.push(v.raw));
		expect(actual).toEqual([10, 20]);
		expect(() => source()).toThrow('stored state');
	});
	it('Generate reuses evaluated object state across subscriptions but reevaluates on new invocation', () => {
		const source = factory(generateOperatorDefinition, {
			initialState: '({n:0})',
			condition: 'function condition(state) { return state.n < 2; }',
			iterate: 'function iterate(state) { state.n++; return state; }',
			resultSelector: 'function resultSelector(state) { return state.n; }',
		});
		const observable = source(),
			first: unknown[] = [],
			second: unknown[] = [],
			fresh: unknown[] = [];
		observable.subscribe((v) => first.push(v.raw));
		observable.subscribe((v) => second.push(v.raw));
		source().subscribe((v) => fresh.push(v.raw));
		expect(first).toEqual([0, 1]);
		expect(second).toEqual([]);
		expect(fresh).toEqual([0, 1]);
	});
	it('Generate callback-producing expressions run once per invocation and closures survive resubscription', () => {
		const observable = factory(generateOperatorDefinition)({
			resultSelector:
				'(() => { let calls = 0; return function resultSelector(state) { return [state,++calls]; }; })()',
		});
		const actual: unknown[] = [];
		observable.subscribe((v) => actual.push(v.raw));
		observable.subscribe((v) => actual.push(v.raw));
		expect(actual).toEqual([
			[0, 1],
			[1, 2],
			[2, 3],
			[0, 4],
			[1, 5],
			[2, 6],
		]);
	});
	it.each([undefined, ''])(
		'Generate supports absent/empty condition %s and cancellation',
		(condition) => {
			const actual: unknown[] = [];
			factory(generateOperatorDefinition)({ condition })
				.pipe(take(3))
				.subscribe((v) => actual.push(v.raw));
			expect(actual).toEqual([0, 1000, 2000]);
		},
	);
	it('Generate distinguishes expression-construction errors from subscribed callback errors', () => {
		const source = factory(generateOperatorDefinition);
		expect(() => source({ iterate: '(() => { throw new Error("construction"); })()' })).toThrow(
			'construction',
		);
		const error = vi.fn();
		source({
			resultSelector: 'function resultSelector() { throw new Error("callback"); }',
		}).subscribe({ error });
		expect(error.mock.calls[0][0]).toBeInstanceOf(Error);
		expect(error.mock.calls[0][0]).not.toBeInstanceOf(FlowValue);
		expect(error.mock.calls[0][0].message).toBe('callback');
	});
	it('ThrowError calls its factory without arguments per subscription and wraps fresh error FlowValues', () => {
		const source = factory(throwErrorOperatorDefinition);
		const observable = source(
			{
				errorOrErrorFactory:
					'(() => { let calls = 0; return function factory() { if (arguments.length || typeof createObservable !== "undefined") throw new Error("arguments"); return {calls:++calls}; }; })()',
			},
			'parent',
		);
		const error = vi.fn();
		observable.subscribe({ error });
		observable.subscribe({ error });
		const errors = error.mock.calls.map(([value]) => value as FlowValue);
		expect(errors.map((v) => v.raw)).toEqual([{ calls: 1 }, { calls: 2 }]);
		expect(errors[0].id).not.toBe(errors[1].id);
		errors.forEach((v) =>
			expect(v).toMatchObject({ elementId: 'source', subscribeId: 'parent' }),
		);
	});
	it('ThrowError evaluates direct error values at invocation and reuses the raw object across subscriptions', () => {
		const observable = factory(throwErrorOperatorDefinition)({
			errorOrErrorFactory: 'new Error("direct")',
		});
		const error = vi.fn();
		observable.subscribe({ error });
		observable.subscribe({ error });
		expect(error.mock.calls[0][0]).toBeInstanceOf(FlowValue);
		expect(error.mock.calls[0][0].raw.message).toBe('direct');
		expect(error.mock.calls[1][0].raw).toBe(error.mock.calls[0][0].raw);
		expect(error.mock.calls[1][0]).not.toBe(error.mock.calls[0][0]);
	});
	it('ThrowError preserves construction failures and wraps errors thrown by its callback', () => {
		const source = factory(throwErrorOperatorDefinition);
		expect(() =>
			source({ errorOrErrorFactory: '(() => { throw new Error("construction"); })()' }),
		).toThrow('construction');
		const error = vi.fn();
		source({
			errorOrErrorFactory: 'function factory() { throw new Error("callback"); }',
		}).subscribe({ error });
		expect(error.mock.calls[0][0]).toBeInstanceOf(FlowValue);
		expect(error.mock.calls[0][0].raw.message).toBe('callback');
	});
});
