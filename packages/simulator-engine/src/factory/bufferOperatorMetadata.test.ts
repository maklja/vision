import { afterEach, describe, expect, it, vi } from 'vitest';
import { EMPTY, Subject, of } from 'rxjs';
import {
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	bufferOperatorDefinition,
	bufferCountOperatorDefinition,
	bufferTimeOperatorDefinition,
	bufferToggleOperatorDefinition,
	bufferWhenOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { MissingReferenceObservableError } from '../errors';
import { ObservableGeneratorProps } from './OperatorFactory';
import { transformationOperatorFactory } from './transformationOperatorFactory';

type BufferDefinition =
	| typeof bufferOperatorDefinition
	| typeof bufferCountOperatorDefinition
	| typeof bufferTimeOperatorDefinition
	| typeof bufferToggleOperatorDefinition
	| typeof bufferWhenOperatorDefinition;
function element(
	definition: BufferDefinition,
	properties: ElementProps = definition.defaults,
): Element {
	return {
		id: 'buffer',
		type: definition.type,
		name: definition.name,
		x: 0,
		y: 0,
		visible: true,
		properties,
	};
}
function reference(
	observableGenerator: ObservableGeneratorProps['observableGenerator'],
	position = ConnectPointPosition.Top,
) {
	const source = {
		id: 'buffer',
		connectPointType: ConnectPointType.Event,
		connectPosition: position,
	};
	return {
		observableGenerator,
		onSubscribe: vi.fn(),
		connectPoint: source,
		connectLine: {
			id: `reference-${position}`,
			name: '',
			index: 0,
			locked: false,
			points: [],
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
afterEach(() => vi.useRealTimers());

describe('buffer operator metadata compatibility', () => {
	it('buffer constructs its notifier at pipe application and retains source/notifier dependencies', () => {
		const notifier = new Subject<FlowValue>();
		const generator = vi.fn<ObservableGeneratorProps['observableGenerator']>(() => notifier);
		const ref = reference(generator);
		const source = new Subject<FlowValue>();
		const operator = transformationOperatorFactory.create(element(bufferOperatorDefinition), {
			refObservableGenerators: [ref],
		});
		expect(generator).not.toHaveBeenCalled();
		const observable = operator(source);
		expect(generator).not.toHaveBeenCalled();
		const actual: FlowValue[] = [];
		const subscription = observable.subscribe((v) => actual.push(v));
		expect(generator.mock.calls[0]).toEqual([undefined, ref.onSubscribe.mock.calls[0][0].id]);

		const first = value(1),
			second = value(2),
			trigger = value('flush'),
			last = value(3);
		source.next(first);
		source.next(second);
		notifier.next(trigger);
		source.next(last);
		source.complete();
		expect(actual.map((v) => v.raw)).toEqual([[1, 2], [3]]);
		expect(actual[0].dependencies).toEqual([first.id, second.id, trigger.id]);
		expect(actual[1].dependencies).toEqual([last.id]);
		expect(actual[0].elementId).toBe('buffer');
		subscription.unsubscribe();
		observable.subscribe().unsubscribe();
		expect(generator).toHaveBeenCalledTimes(2);
		expect(ref.onSubscribe).toHaveBeenCalledTimes(2);
	});

	it('bufferCount preserves overlapping defaults and flushes the remaining buffer', () => {
		const source = [value(1), value(2), value(3), value(4)];
		const actual: FlowValue[] = [];
		transformationOperatorFactory
			.create(element(bufferCountOperatorDefinition), { refObservableGenerators: [] })(
				of(...source),
			)
			.subscribe((v) => actual.push(v));
		expect(actual.map((v) => v.raw)).toEqual([
			[1, 2, 3],
			[3, 4],
		]);
		expect(actual.map((v) => v.dependencies)).toEqual([
			source.slice(0, 3).map((v) => v.id),
			source.slice(2).map((v) => v.id),
		]);
	});

	it('bufferCount passes zero start interval unchanged instead of replacing it with buffer size', () => {
		const actual: unknown[] = [];
		transformationOperatorFactory
			.create(
				element(bufferCountOperatorDefinition, { bufferSize: 3, startBufferEvery: 0 }),
				{ refObservableGenerators: [] },
			)(of(value(1), value(2), value(3)))
			.subscribe((v) => actual.push(v.raw));
		expect(actual).toEqual([]);
	});

	it.each([undefined, 0, 2])(
		'bufferTime preserves max size %s and source completion',
		(maxBufferSize) => {
			vi.useFakeTimers();
			const source = new Subject<FlowValue>();
			const actual: unknown[] = [];
			transformationOperatorFactory
				.create(
					element(bufferTimeOperatorDefinition, {
						bufferTimeSpan: 100,
						...(maxBufferSize === undefined ? {} : { maxBufferSize }),
					}),
					{ refObservableGenerators: [] },
				)(source)
				.subscribe((v) => actual.push(v.raw));
			source.next(value(1));
			source.next(value(2));
			expect(actual).toEqual(maxBufferSize === 2 ? [[1, 2]] : []);
			vi.advanceTimersByTime(100);
			expect(actual).toEqual(maxBufferSize === 2 ? [[1, 2], []] : [[1, 2]]);
			source.next(value(3));
			source.complete();
			expect(actual.at(-1)).toEqual([3]);
		},
	);

	it('bufferTime honors a separate buffer creation interval', () => {
		vi.useFakeTimers();
		const source = new Subject<FlowValue>();
		const actual: unknown[] = [];
		transformationOperatorFactory
			.create(
				element(bufferTimeOperatorDefinition, {
					bufferTimeSpan: 100,
					bufferCreationInterval: 50,
				}),
				{ refObservableGenerators: [] },
			)(source)
			.subscribe((v) => actual.push(v.raw));
		source.next(value(1));
		vi.advanceTimersByTime(60);
		source.next(value(2));
		vi.advanceTimersByTime(40);
		expect(actual).toEqual([[1, 2]]);
		source.complete();
		expect(actual).toEqual([[1, 2], [2], []]);
	});

	it('bufferToggle binds reversed references by port and preserves callback scope and legacy IDs', () => {
		const openings = new Subject<FlowValue>(),
			closings = new Subject<FlowValue>(),
			source = new Subject<FlowValue>();
		const openingGenerator = vi.fn<ObservableGeneratorProps['observableGenerator']>(
			() => openings,
		);
		const closingGenerator = vi.fn<ObservableGeneratorProps['observableGenerator']>(
			() => closings,
		);
		const top = reference(openingGenerator),
			bottom = reference(closingGenerator, ConnectPointPosition.Bottom);
		const project =
			'(() => { let calls = 0; return function closing(raw) { if (arguments.length !== 1) throw new Error("arguments"); return createObservable({raw,calls:++calls}); }; })()';
		const observable = transformationOperatorFactory.create(
			element(bufferToggleOperatorDefinition, { closingSelectorExpression: project }),
			{ refObservableGenerators: [bottom, top] },
		)(source);
		expect(openingGenerator).not.toHaveBeenCalled();
		expect(closingGenerator).not.toHaveBeenCalled();
		const actual: FlowValue[] = [];
		const subscription = observable.subscribe((v) => actual.push(v));
		const opening = value('open');
		openings.next(opening);
		const item = value(1);
		source.next(item);
		closings.next(value('close'));
		openings.next(value('again'));
		source.next(value(2));
		source.complete();
		subscription.unsubscribe();
		expect(actual.map((v) => v.raw)).toEqual([[1], [2]]);
		expect(actual[0].dependencies).toEqual([item.id]);
		expect(closingGenerator.mock.calls.map(([overrides]) => overrides)).toEqual([
			{ raw: 'open', calls: 1 },
			{ raw: 'again', calls: 2 },
		]);
		const sharedId = openingGenerator.mock.calls[0][1];
		expect(closingGenerator.mock.calls.map(([, id]) => id)).toEqual([sharedId, sharedId]);
		expect(top.onSubscribe.mock.calls[0][0].id).toBe(sharedId);
		expect(bottom.onSubscribe.mock.calls[0][0]).toMatchObject({ dependencies: [opening.id] });
		expect(bottom.onSubscribe.mock.calls[0][0].id).not.toBe(sharedId);
		expect(bottom.onSubscribe.mock.calls[1][0].id).not.toBe(
			bottom.onSubscribe.mock.calls[0][0].id,
		);
	});

	it('bufferWhen reevaluates its expression per buffer and resets scope across subscriptions', () => {
		const closings = new Subject<FlowValue>(),
			source = new Subject<FlowValue>();
		const generator = vi.fn<ObservableGeneratorProps['observableGenerator']>(() => closings);
		const ref = reference(generator);
		const expression =
			'(() => { let calls = 0; return function closing() { if (arguments.length) throw new Error("arguments"); return createObservable({calls:++calls}); }; })()';
		const observable = transformationOperatorFactory.create(
			element(bufferWhenOperatorDefinition, { closingSelectorExpression: expression }),
			{ refObservableGenerators: [ref] },
		)(source);
		expect(generator).not.toHaveBeenCalled();
		const actual: FlowValue[] = [];
		const subscription = observable.subscribe((v) => actual.push(v));
		const first = value(1),
			last = value(2);
		source.next(first);
		closings.next(value('close'));
		source.next(last);
		source.complete();
		subscription.unsubscribe();
		expect(actual.map((v) => v.raw)).toEqual([[1], [2]]);
		expect(actual.map((v) => v.dependencies)).toEqual([[first.id], [last.id]]);
		observable.subscribe().unsubscribe();
		expect(generator.mock.calls.map(([overrides]) => overrides)).toEqual([
			{ calls: 1 },
			{ calls: 1 },
			{ calls: 1 },
		]);
		const ids = generator.mock.calls.map(([, id]) => id);
		expect(new Set(ids).size).toBe(3);
		ids.forEach((id, index) =>
			expect(ref.onSubscribe.mock.calls[index][0]).toMatchObject({ id, dependencies: [] }),
		);
	});

	it.each([bufferOperatorDefinition, bufferWhenOperatorDefinition])(
		'$name requires one reference',
		(definition) => {
			const create = (refs: ObservableGeneratorProps[]) =>
				transformationOperatorFactory.create(element(definition), {
					refObservableGenerators: refs,
				})(EMPTY);
			expect(() => create([])).toThrow(MissingReferenceObservableError);
			const ref = reference(() => EMPTY);
			expect(() => create([ref, ref])).toThrow('Too many reference observables');
		},
	);
	it.each([ConnectPointPosition.Top, ConnectPointPosition.Bottom])(
		'bufferToggle requires the missing %s reference',
		(missing) => {
			const other =
				missing === ConnectPointPosition.Top
					? ConnectPointPosition.Bottom
					: ConnectPointPosition.Top;
			expect(() =>
				transformationOperatorFactory.create(element(bufferToggleOperatorDefinition), {
					refObservableGenerators: [reference(() => EMPTY, other)],
				})(EMPTY),
			).toThrow(MissingReferenceObservableError);
		},
	);
});
