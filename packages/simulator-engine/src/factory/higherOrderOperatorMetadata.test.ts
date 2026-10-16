import { describe, expect, it, vi } from 'vitest';
import { EMPTY, Subject, of } from 'rxjs';
import {
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	concatMapOperatorDefinition,
	exhaustMapOperatorDefinition,
	expandOperatorDefinition,
	mergeMapOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { MissingReferenceObservableError } from '../errors';
import { ObservableGeneratorProps } from './OperatorFactory';
import { transformationOperatorFactory } from './transformationOperatorFactory';

const definitions = [
	concatMapOperatorDefinition,
	exhaustMapOperatorDefinition,
	expandOperatorDefinition,
	mergeMapOperatorDefinition,
];
function element(definition: (typeof definitions)[number], properties: ElementProps): Element {
	return {
		id: 'operator',
		name: definition.name,
		type: definition.type,
		x: 0,
		y: 0,
		visible: true,
		properties,
	};
}
function reference(observableGenerator: ObservableGeneratorProps['observableGenerator']) {
	const source = {
		id: 'operator',
		connectPointType: ConnectPointType.Event,
		connectPosition: ConnectPointPosition.Top,
	};
	return {
		observableGenerator,
		onSubscribe: vi.fn(),
		connectPoint: source,
		connectLine: {
			id: 'reference',
			name: '',
			points: [],
			index: 0,
			locked: false,
			source,
			target: {
				id: 'child',
				connectPointType: ConnectPointType.Input,
				connectPosition: ConnectPointPosition.Left,
			},
		},
	};
}
const value = (raw: unknown) => FlowValue.createNextEvent({ elementId: 'source', value: raw });

describe('higher-order operator metadata compatibility', () => {
	it.each(definitions)(
		'$name binds raw arguments, fresh expression scope and child subscription dependencies',
		(definition) => {
			const children: FlowValue[] = [];
			const generator = vi.fn((overrides?: ElementProps, subscribeId?: string) => {
				const child = FlowValue.createNextEvent({
					elementId: 'child',
					value: overrides,
					subscribeId,
				});
				children.push(child);
				return definition === expandOperatorDefinition ? EMPTY : of(child);
			});
			const ref = reference(generator);
			const sourceValues = [value('a'), value('b')];
			const projectExpression = `(() => { let local = 0; return function project(raw, index) { if (arguments.length !== 2) throw new Error('arguments'); return createObservable({ raw, index, local: ++local }); }; })()`;
			const operator = transformationOperatorFactory.create(
				element(definition, { ...definition.defaults, projectExpression }),
				{ refObservableGenerators: [ref] },
			);
			expect(generator).not.toHaveBeenCalled();
			const observable = operator(of(...sourceValues));
			expect(generator).not.toHaveBeenCalled();
			const actual: FlowValue[] = [];
			observable.subscribe((v) => actual.push(v));
			observable.subscribe((v) => actual.push(v));
			expect(generator.mock.calls.map(([overrides]) => overrides)).toEqual([
				{ raw: 'a', index: 0, local: 1 },
				{ raw: 'b', index: 1, local: 1 },
				{ raw: 'a', index: 0, local: 1 },
				{ raw: 'b', index: 1, local: 1 },
			]);
			const ids = generator.mock.calls.map(([, id]) => id);
			expect(new Set(ids).size).toBe(4);
			ids.forEach((id, index) => {
				expect(id).toEqual(expect.any(String));
				expect(ref.onSubscribe.mock.calls[index][0]).toMatchObject({
					id,
					elementId: 'operator',
					dependencies: [sourceValues[index % 2].id],
				});
			});
			expect(actual).toEqual(
				definition === expandOperatorDefinition
					? [...sourceValues, ...sourceValues]
					: children,
			);
			actual.forEach((v, index) =>
				expect(v).toBe(
					(definition === expandOperatorDefinition
						? [...sourceValues, ...sourceValues]
						: children)[index],
				),
			);
		},
	);

	it.each(definitions)('$name propagates authored project failures', (definition) => {
		const ref = reference(() => EMPTY);
		const failure = vi.fn();
		transformationOperatorFactory
			.create(
				element(definition, {
					...definition.defaults,
					projectExpression: 'function project() { throw new Error("project failure"); }',
				}),
				{ refObservableGenerators: [ref] },
			)(of(value(1)))
			.subscribe({ error: failure });
		expect(failure).toHaveBeenCalledOnce();
		expect(failure.mock.calls[0][0]).toMatchObject({ message: 'project failure' });
	});

	it.each(definitions)(
		'$name requires exactly one reference even for an empty source',
		(definition) => {
			const factory = (refs: ObservableGeneratorProps[]) =>
				transformationOperatorFactory.create(element(definition, definition.defaults), {
					refObservableGenerators: refs,
				})(EMPTY);
			expect(() => factory([])).toThrow(MissingReferenceObservableError);
			const ref = reference(() => EMPTY);
			expect(() => factory([ref, ref])).toThrow('Too many reference observables');
		},
	);

	it.each([
		{ definition: concatMapOperatorDefinition, concurrent: undefined, expected: [0, 1] },
		{ definition: exhaustMapOperatorDefinition, concurrent: undefined, expected: [0] },
		{ definition: mergeMapOperatorDefinition, concurrent: 1, expected: [0, 1] },
		{ definition: mergeMapOperatorDefinition, concurrent: undefined, expected: [0, 1] },
		{ definition: mergeMapOperatorDefinition, concurrent: 0, expected: [] },
		{ definition: mergeMapOperatorDefinition, concurrent: -1, expected: [] },
	])(
		'$definition.name preserves concurrency $concurrent and projection indices',
		({ definition, concurrent, expected }) => {
			const inners: Subject<FlowValue>[] = [];
			const generator = vi.fn<ObservableGeneratorProps['observableGenerator']>(() => {
				const inner = new Subject<FlowValue>();
				inners.push(inner);
				return inner;
			});
			const ref = reference(generator);
			const source = new Subject<FlowValue>();
			const properties = {
				...definition.defaults,
				concurrent,
				projectExpression:
					'function project(raw, index) { return createObservable({ raw, index }); }',
			};
			const subscription = transformationOperatorFactory
				.create(element(definition, properties), { refObservableGenerators: [ref] })(source)
				.subscribe();
			source.next(value('a'));
			source.next(value('b'));
			expect(generator).toHaveBeenCalledTimes(
				concurrent !== undefined && concurrent <= 0
					? 0
					: definition === mergeMapOperatorDefinition && concurrent === undefined
						? 2
						: 1,
			);
			inners[0]?.complete();
			expect(ref.onSubscribe.mock.calls.length).toBe(expected.length);
			// The running index counts actual projections; exhaustMap's ignored value never invokes it.
			expect(generator.mock.calls.map(([args]) => args?.index)).toEqual(expected);
			if (definition === exhaustMapOperatorDefinition) {
				source.next(value('c'));
				expect(generator.mock.calls[1][0]).toEqual({ raw: 'c', index: 1 });
			}

			source.complete();
			subscription.unsubscribe();
		},
	);

	it.each([undefined, 1, 0, -1])(
		'expand preserves recursive raw values and concurrency %s',
		(concurrent) => {
			const generator = vi.fn((overrides?: ElementProps) =>
				Number(overrides?.raw) < 3 ? of(value(Number(overrides?.raw) + 1)) : EMPTY,
			);
			const ref = reference(generator);
			const actual: unknown[] = [];
			transformationOperatorFactory
				.create(
					element(expandOperatorDefinition, {
						...expandOperatorDefinition.defaults,
						concurrent,
						projectExpression:
							'function project(raw, index) { return createObservable({raw,index}); }',
					}),
					{ refObservableGenerators: [ref] },
				)(of(value(1)))
				.subscribe((v) => actual.push(v.raw));
			expect(actual).toEqual([1, 2, 3]);
			expect(generator.mock.calls.map(([args]) => args)).toEqual([
				{ raw: 1, index: 0 },
				{ raw: 2, index: 1 },
				{ raw: 3, index: 2 },
			]);
		},
	);
});
