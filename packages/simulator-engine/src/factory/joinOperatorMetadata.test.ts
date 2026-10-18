import { describe, expect, it, vi } from 'vitest';
import { EMPTY, Subject, of } from 'rxjs';
import {
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ObservableInputsType,
	combineLatestOperatorDefinition,
	concatOperatorDefinition,
	forkJoinOperatorDefinition,
	raceOperatorDefinition,
	zipOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { CreationObservableFactory, ObservableGeneratorProps } from './OperatorFactory';
import { joinCreationOperatorFactory } from './joinCreationOperatorFactory';

const definitions = [
	combineLatestOperatorDefinition,
	concatOperatorDefinition,
	forkJoinOperatorDefinition,
	raceOperatorDefinition,
	zipOperatorDefinition,
];
function element(
	definition: (typeof definitions)[number],
	properties: ElementProps = definition.defaults,
): Element {
	return {
		id: 'join',
		type: definition.type,
		name: definition.name,
		x: 0,
		y: 0,
		visible: true,
		properties,
	};
}
function reference(name: string, raw: unknown, index = 0) {
	const values: FlowValue[] = [];
	const observableGenerator = vi.fn<CreationObservableFactory>((...args) => {
		const value = FlowValue.createNextEvent({
			elementId: name,
			value: raw,
			subscribeId: args[1],
		});
		values.push(value);
		return of(value);
	});
	const source = {
		id: 'join',
		connectPointType: ConnectPointType.Event,
		connectPosition: ConnectPointPosition.Top,
	};
	const props = {
		observableGenerator,
		onSubscribe: vi.fn<(value: FlowValue) => void>(),
		connectPoint: source,
		connectLine: {
			id: `line-${index}`,
			name,
			index,
			points: [],
			locked: false,
			source,
			target: {
				id: name,
				connectPointType: ConnectPointType.Input,
				connectPosition: ConnectPointPosition.Left,
			},
		},
	};
	return { props: props satisfies ObservableGeneratorProps, values, observableGenerator };
}

describe('join operator metadata compatibility', () => {
	it.each(definitions)(
		'$name keeps child overrides local and subscribes lazily with fresh parent-correlated subscription IDs',
		(definition) => {
			const left = reference('left', 1, 10),
				right = reference('right', 2, 1);
			const factory = joinCreationOperatorFactory.create(element(definition), {
				refObservableGenerators: [left.props, right.props],
			});
			const overrides = {};
			const observable = factory(overrides, 'parent');
			expect(left.observableGenerator).not.toHaveBeenCalled();
			expect(right.observableGenerator).not.toHaveBeenCalled();
			const actual: FlowValue[] = [];
			observable.subscribe((v) => actual.push(v));
			observable.subscribe((v) => actual.push(v));
			const race = definition === raceOperatorDefinition,
				concat = definition === concatOperatorDefinition;
			expect(actual.map((v) => v.raw)).toEqual(
				race
					? [1, 1]
					: concat
						? [1, 2, 1, 2]
						: [
								[1, 2],
								[1, 2],
							],
			);
			const subscribed = race ? [left] : [left, right];
			const ids: string[] = [];
			for (const ref of subscribed) {
				expect(ref.observableGenerator).toHaveBeenCalledTimes(2);
				ref.observableGenerator.mock.calls.forEach(([props, id], index) => {
					expect(props).toBeUndefined();
					expect(id).toEqual(expect.any(String));
					ids.push(id!);
					expect(ref.props.onSubscribe.mock.calls[index][0]).toMatchObject({
						elementId: 'join',
						id,
						subscribeId: 'parent',
						dependencies: [],
					});
				});
			}
			expect(new Set(ids).size).toBe(ids.length);
			if (race) expect(right.observableGenerator).not.toHaveBeenCalled();
			if (concat || race) {
				const expected = race
					? left.values
					: [left.values[0], right.values[0], left.values[1], right.values[1]];
				actual.forEach((v, index) => expect(v).toBe(expected[index]));
			} else {
				actual.forEach((v, index) =>
					expect(v.dependencies).toEqual([left.values[index].id, right.values[index].id]),
				);
			}
		},
	);

	it.each([combineLatestOperatorDefinition, forkJoinOperatorDefinition])(
		'$name applies a join-local input mode override',
		(definition) => {
			const left = reference('left', 1),
				right = reference('right', 2);
			const actual: FlowValue[] = [];
			joinCreationOperatorFactory
				.create(
					element(definition, { observableInputsType: ObservableInputsType.Object }),
					{ refObservableGenerators: [left.props, right.props] },
				)({ observableInputsType: ObservableInputsType.Array }, 'parent')
				.subscribe((v) => actual.push(v));
			expect(actual.map((v) => v.raw)).toEqual([[1, 2]]);
			expect(actual[0].dependencies).toEqual([left.values[0].id, right.values[0].id]);
			expect(left.observableGenerator.mock.calls[0][0]).toBeUndefined();
		},
	);

	it.each([combineLatestOperatorDefinition, forkJoinOperatorDefinition])(
		'$name preserves last-wins duplicate names and integer-key ordering',
		(definition) => {
			const overwritten = reference('10', 0, 0),
				ten = reference('10', 1, 1),
				two = reference('2', 2, 2);
			const actual: FlowValue[] = [];
			joinCreationOperatorFactory
				.create(
					element(definition, { observableInputsType: ObservableInputsType.Object }),
					{ refObservableGenerators: [overwritten.props, ten.props, two.props] },
				)()
				.subscribe((v) => actual.push(v));
			expect(overwritten.observableGenerator).not.toHaveBeenCalled();
			expect(actual.map((v) => v.raw)).toEqual([{ '2': 2, '10': 1 }]);
			expect(actual[0].dependencies).toEqual([two.values[0].id, ten.values[0].id]);
		},
	);

	it.each(definitions)('$name preserves its no-reference completion behavior', (definition) => {
		const next = vi.fn(),
			complete = vi.fn();
		const subscription = joinCreationOperatorFactory
			.create(element(definition), { refObservableGenerators: [] })()
			.subscribe({ next, complete });
		expect(next).not.toHaveBeenCalled();
		expect(complete).toHaveBeenCalledTimes(definition === raceOperatorDefinition ? 0 : 1);
		subscription.unsubscribe();
	});

	it('concat subscribes to the next input only after completion', () => {
		const first = new Subject<FlowValue>();
		const left = reference('left', 1),
			right = reference('right', 2);
		left.observableGenerator.mockReturnValue(first);
		const actual: unknown[] = [];
		joinCreationOperatorFactory
			.create(element(concatOperatorDefinition), {
				refObservableGenerators: [left.props, right.props],
			})()
			.subscribe((v) => actual.push(v.raw));
		expect(right.observableGenerator).not.toHaveBeenCalled();
		first.next(FlowValue.createNextEvent({ elementId: 'left', value: 1 }));
		first.complete();
		expect(actual).toEqual([1, 2]);
		expect(right.observableGenerator).toHaveBeenCalledOnce();
	});

	it('race unsubscribes the losing input when the other emits', () => {
		const leftSubject = new Subject<FlowValue>(),
			rightSubject = new Subject<FlowValue>();
		const left = reference('left', 1),
			right = reference('right', 2);
		left.observableGenerator.mockReturnValue(leftSubject);
		right.observableGenerator.mockReturnValue(rightSubject);
		const actual: unknown[] = [];
		const subscription = joinCreationOperatorFactory
			.create(element(raceOperatorDefinition), {
				refObservableGenerators: [left.props, right.props],
			})()
			.subscribe((v) => actual.push(v.raw));
		expect(leftSubject.observed).toBe(true);
		expect(rightSubject.observed).toBe(true);
		rightSubject.next(FlowValue.createNextEvent({ elementId: 'right', value: 2 }));
		expect(leftSubject.observed).toBe(false);
		leftSubject.next(FlowValue.createNextEvent({ elementId: 'left', value: 1 }));
		expect(actual).toEqual([2]);
		subscription.unsubscribe();
	});

	it.each([combineLatestOperatorDefinition, forkJoinOperatorDefinition, zipOperatorDefinition])(
		'$name emits nothing if an input completes empty',
		(definition) => {
			const left = reference('left', 1),
				right = reference('right', 2);
			left.observableGenerator.mockReturnValue(EMPTY);
			const next = vi.fn(),
				complete = vi.fn();
			joinCreationOperatorFactory
				.create(element(definition), {
					refObservableGenerators: [left.props, right.props],
				})()
				.subscribe({ next, complete });
			expect(next).not.toHaveBeenCalled();
			expect(complete).toHaveBeenCalledOnce();
		},
	);
});
