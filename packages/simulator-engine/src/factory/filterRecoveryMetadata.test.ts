import { describe, expect, it, vi } from 'vitest';
import { EMPTY, concat, defer, of, throwError } from 'rxjs';
import {
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	filterOperatorDefinition,
	catchErrorOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { MissingReferenceObservableError } from '../errors';
import { CreationObservableFactory, ObservableGeneratorProps } from './OperatorFactory';
import { filteringOperatorFactory } from './filteringOperatorFactory';
import { errorHandlingOperatorFactory } from './errorHandlingOperatorFactory';

function element(
	definition: typeof filterOperatorDefinition | typeof catchErrorOperatorDefinition,
	properties: ElementProps = definition.defaults,
): Element {
	return {
		id: 'operator',
		type: definition.type,
		name: definition.name,
		x: 0,
		y: 0,
		visible: true,
		properties,
	};
}
function reference() {
	const values: FlowValue[] = [];
	const observableGenerator = vi.fn<CreationObservableFactory>((...args) => {
		const value = FlowValue.createNextEvent({
			elementId: 'recovery',
			value: args[0],
			subscribeId: args[1],
		});
		values.push(value);
		return of(value);
	});
	const source = {
		id: 'operator',
		connectPointType: ConnectPointType.Event,
		connectPosition: ConnectPointPosition.Top,
	};
	const props = {
		observableGenerator,
		onSubscribe: vi.fn<(value: FlowValue) => void>(),
		connectPoint: source,
		connectLine: {
			id: 'reference',
			name: '',
			index: 0,
			points: [],
			locked: false,
			source,
			target: {
				id: 'recovery',
				connectPointType: ConnectPointType.Input,
				connectPosition: ConnectPointPosition.Left,
			},
		},
	} satisfies ObservableGeneratorProps;
	return { props, values, observableGenerator };
}
const value = (raw: unknown) =>
	FlowValue.createNextEvent({
		elementId: 'source',
		value: raw,
		subscribeId: 'source-subscription',
		dependencies: ['dependency'],
	});

describe('filter and recovery metadata compatibility', () => {
	it('Filter receives raw values with index zero and retains identity fields through copy', () => {
		const expression =
			'(() => { let calls = 0; return function predicate(value, index) { if (arguments.length !== 2 || index !== 0 || typeof createObservable !== "undefined") throw new Error("arguments"); return value.keep && ++calls <= 2; }; })()';
		const source = [value({ keep: true }), value({ keep: false }), value({ keep: true })];
		const observable = filteringOperatorFactory.create(
			element(filterOperatorDefinition, { predicateExpression: expression }),
			{ refObservableGenerators: [] },
		)(of(...source));
		const first: FlowValue[] = [],
			second: FlowValue[] = [];
		observable.subscribe((v) => first.push(v));
		observable.subscribe((v) => second.push(v));
		expect(first).toEqual([source[0], source[2]]);
		expect(second).toEqual([]);
		expect(first[0]).not.toBe(source[0]);
		expect(first[0].raw).toBe(source[0].raw);
	});
	it.each([
		{ result: '"truthy"', count: 2 },
		{ result: '0', count: 0 },
	])('Filter uses predicate truthiness for $result', ({ result, count }) => {
		const actual: FlowValue[] = [];
		filteringOperatorFactory
			.create(
				element(filterOperatorDefinition, {
					predicateExpression: `function predicate() { return ${result}; }`,
				}),
				{ refObservableGenerators: [] },
			)(of(value(1), value(2)))
			.subscribe((v) => actual.push(v));
		expect(actual).toHaveLength(count);
	});
	it('Filter preserves expression-construction and predicate-error boundaries', () => {
		expect(() =>
			filteringOperatorFactory.create(
				element(filterOperatorDefinition, {
					predicateExpression: '(() => { throw new Error("construction"); })()',
				}),
				{ refObservableGenerators: [] },
			)(EMPTY),
		).toThrow('construction');
		const error = vi.fn();
		filteringOperatorFactory
			.create(
				element(filterOperatorDefinition, {
					predicateExpression: 'function predicate() { throw new Error("predicate"); }',
				}),
				{ refObservableGenerators: [] },
			)(of(value(1)))
			.subscribe({ error });
		expect(error.mock.calls[0][0]).toMatchObject({ message: 'predicate' });
	});
	it('CatchError receives raw errors and forwards overrides with a shared application-time ID', () => {
		const ref = reference(),
			passthrough = value(1),
			failure = FlowValue.createErrorEvent({ code: 'failure' }, 'source');
		const selector =
			'(() => { let calls = 0; return function selector(err, caught) { if (arguments.length !== 2 || typeof caught.subscribe !== "function") throw new Error("arguments"); return createObservable({error:err, calls:++calls}); }; })()';
		const factory = errorHandlingOperatorFactory.create(
			element(catchErrorOperatorDefinition, { selectorExpression: selector }),
			{ refObservableGenerators: [ref.props] },
		);
		const observable = factory(
			concat(
				of(passthrough),
				throwError(() => failure),
			),
		);
		expect(ref.observableGenerator).not.toHaveBeenCalled();
		expect(ref.props.onSubscribe).not.toHaveBeenCalled();
		const actual: FlowValue[] = [];
		observable.subscribe((v) => actual.push(v));
		observable.subscribe((v) => actual.push(v));
		expect(actual[0]).toBe(passthrough);
		expect(actual[2]).toBe(passthrough);
		expect(actual[1]).toBe(ref.values[0]);
		expect(actual[3]).toBe(ref.values[1]);
		expect(ref.observableGenerator.mock.calls.map(([props]) => props)).toEqual([
			{ error: failure.raw, calls: 1 },
			{ error: failure.raw, calls: 2 },
		]);
		const id = ref.observableGenerator.mock.calls[0][1];
		expect(id).toEqual(expect.any(String));
		expect(ref.observableGenerator.mock.calls[1][1]).toBe(id);
		for (const [event] of ref.props.onSubscribe.mock.calls)
			expect(event).toMatchObject({
				id,
				elementId: 'operator',
				subscribeId: null,
				dependencies: [failure.id],
			});
	});
	it('CatchError evaluates the selector expression at pipe application even without an error', () => {
		const ref = reference();
		const selector =
			'(() => { createObservable({phase:"construction"}); return function selector() { throw new Error("must not recover"); }; })()';
		const factory = errorHandlingOperatorFactory.create(
			element(catchErrorOperatorDefinition, { selectorExpression: selector }),
			{ refObservableGenerators: [ref.props] },
		);
		expect(ref.observableGenerator).not.toHaveBeenCalled();
		const original = value(1),
			observable = factory(of(original));
		expect(ref.observableGenerator.mock.calls[0][0]).toEqual({ phase: 'construction' });
		const actual: FlowValue[] = [];
		observable.subscribe((v) => actual.push(v));
		expect(actual).toEqual([original]);
		expect(actual[0]).toBe(original);
		expect(ref.props.onSubscribe).not.toHaveBeenCalled();
	});
	it('CatchError exposes caught raw values and forwards them without rewrapping', () => {
		const ref = reference(),
			failure = FlowValue.createErrorEvent('retry', 'source');
		let subscriptions = 0;
		const source = defer(() =>
			++subscriptions === 1 ? throwError(() => failure) : of(value(7)),
		);
		const actual: unknown[] = [];
		errorHandlingOperatorFactory
			.create(
				element(catchErrorOperatorDefinition, {
					selectorExpression:
						'function selector(err, caught) { if (err !== "retry") throw new Error("raw error"); return caught; }',
				}),
				{ refObservableGenerators: [ref.props] },
			)(source)
			.subscribe((v) => actual.push(v));
		expect(actual).toEqual([7]);
		expect(subscriptions).toBe(2);
		expect(ref.observableGenerator).not.toHaveBeenCalled();
		expect(ref.props.onSubscribe).toHaveBeenCalledOnce();
		expect(ref.props.onSubscribe.mock.calls[0][0].dependencies).toEqual([failure.id]);
	});
	it('CatchError requires exactly one reference even for a source that never errors', () => {
		const factory = (refs: ObservableGeneratorProps[]) =>
			errorHandlingOperatorFactory.create(element(catchErrorOperatorDefinition), {
				refObservableGenerators: refs,
			})(EMPTY);
		expect(() => factory([])).toThrow(MissingReferenceObservableError);
		const ref = reference();
		expect(() => factory([ref.props, ref.props])).toThrow('Too many reference observables');
	});
	it('CatchError propagates a selector failure after recording the recovery subscription', () => {
		const ref = reference(),
			failure = FlowValue.createErrorEvent('failure', 'source'),
			error = vi.fn();
		errorHandlingOperatorFactory
			.create(
				element(catchErrorOperatorDefinition, {
					selectorExpression:
						'function selector() { throw new Error("selector failure"); }',
				}),
				{ refObservableGenerators: [ref.props] },
			)(throwError(() => failure))
			.subscribe({ error });
		expect(error.mock.calls[0][0]).toMatchObject({ message: 'selector failure' });
		expect(ref.props.onSubscribe).toHaveBeenCalledOnce();
		expect(ref.observableGenerator).not.toHaveBeenCalled();
	});
});
