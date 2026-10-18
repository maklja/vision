import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	deferOperatorDefinition,
	Element,
	ElementProps,
	iifOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { MissingReferenceObservableError } from '../errors';
import { creationOperatorFactory } from './creationOperatorFactory';

function reference(id: string, position: ConnectPointPosition) {
	const values: FlowValue[] = [];
	const observableGenerator = vi.fn((_overrides?: ElementProps, subscribeId?: string) => {
		const value = FlowValue.createNextEvent({ elementId: id, value: id, subscribeId });
		values.push(value);
		return of(value);
	});
	const connectLine: ConnectLine = {
		id: `line-${id}`,
		name: '',
		points: [],
		locked: false,
		index: 0,
		source: {
			id: 'operator',
			connectPointType: ConnectPointType.Event,
			connectPosition: position,
		},
		target: {
			id,
			connectPointType: ConnectPointType.Input,
			connectPosition: ConnectPointPosition.Left,
		},
	};
	return {
		values,
		props: {
			connectLine,
			connectPoint: connectLine.source,
			observableGenerator,
			onSubscribe: vi.fn(),
		},
	};
}

function element(
	definition: typeof iifOperatorDefinition | typeof deferOperatorDefinition,
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

function assertForwarded(referenceValue: ReturnType<typeof reference>, actual: FlowValue[]) {
	expect(referenceValue.props.observableGenerator).toHaveBeenCalledTimes(2);
	expect(referenceValue.props.onSubscribe).toHaveBeenCalledTimes(2);
	for (let index = 0; index < 2; index++) {
		expect(actual[index]).toBe(referenceValue.values[index]);
		expect(referenceValue.props.observableGenerator.mock.calls[index]).toEqual([
			{ count: 2 },
			actual[index].subscribeId,
		]);
		expect(referenceValue.props.onSubscribe.mock.calls[index][0]).toMatchObject({
			id: actual[index].subscribeId,
			subscribeId: 'parent',
		});
	}
}

describe('conditional operator metadata compatibility', () => {
	it.each([true, false])(
		'IIf selects by resolved condition %s and binds helpers by port position',
		(condition) => {
			const top = reference('top', ConnectPointPosition.Top);
			const bottom = reference('bottom', ConnectPointPosition.Bottom);
			const properties = {
				...iifOperatorDefinition.defaults,
				conditionExpression: `function condition() { if (arguments.length || typeof createObservable !== 'undefined') throw new Error('unexpected binding'); return ${condition}; }`,
				trueCallbackExpression:
					'function trueResult() { throw new Error("stored branch must be overridden"); }',
				falseCallbackExpression:
					'function falseResult() { throw new Error("stored branch must be overridden"); }',
			};
			const source = creationOperatorFactory.create(
				element(iifOperatorDefinition, properties),
				{
					// Deliberately reverse reference order: top/bottom, not array order, selects the binding.
					refObservableGenerators: [bottom.props, top.props],
				},
			);
			const selected = condition ? top : bottom;
			const unchosen = condition ? bottom : top;
			const callback =
				'function result() { if (arguments.length) throw new Error("unexpected arguments"); return createObservable({ count: 2 }); }';
			const unchosenCallback =
				'function result() { throw new Error("unchosen branch invoked"); }';
			const observable = source(
				{
					conditionExpression: `function condition() { return ${condition}; }`,
					trueCallbackExpression: condition ? callback : unchosenCallback,
					falseCallbackExpression: condition ? unchosenCallback : callback,
				},
				'parent',
			);
			expect(top.props.observableGenerator).not.toHaveBeenCalled();
			expect(bottom.props.observableGenerator).not.toHaveBeenCalled();
			const actual: FlowValue[] = [];
			observable.subscribe((value) => actual.push(value));
			observable.subscribe((value) => actual.push(value));
			expect(actual.map((value) => value.raw)).toEqual([
				selected.values[0].raw,
				selected.values[0].raw,
			]);
			assertForwarded(selected, actual);
			expect(unchosen.props.observableGenerator).not.toHaveBeenCalled();
			expect(unchosen.props.onSubscribe).not.toHaveBeenCalled();
			expect(properties.trueCallbackExpression).toContain('stored branch must be overridden');
			expect(properties.falseCallbackExpression).toContain(
				'stored branch must be overridden',
			);
		},
	);

	it('IIf reevaluates its condition for each subscription', () => {
		const top = reference('top', ConnectPointPosition.Top);
		const bottom = reference('bottom', ConnectPointPosition.Bottom);
		const source = creationOperatorFactory.create(
			element(iifOperatorDefinition, {
				...iifOperatorDefinition.defaults,
				conditionExpression:
					'(function () { let first = true; return function condition() { const result = first; first = false; return result; }; })()',
			}),
			{ refObservableGenerators: [top.props, bottom.props] },
		);
		const observable = source();
		const values: unknown[] = [];
		observable.subscribe((value) => values.push(value.raw));
		observable.subscribe((value) => values.push(value.raw));
		expect(values).toEqual(['top', 'top']);
		expect(top.props.onSubscribe).toHaveBeenCalledTimes(2);
		expect(bottom.props.onSubscribe).not.toHaveBeenCalled();
	});

	it.each([ConnectPointPosition.Top, ConnectPointPosition.Bottom])(
		'IIf requires the %s branch even for a constant condition',
		(missingPosition) => {
			const existing = reference(
				'other',
				missingPosition === ConnectPointPosition.Top
					? ConnectPointPosition.Bottom
					: ConnectPointPosition.Top,
			);
			const source = creationOperatorFactory.create(element(iifOperatorDefinition), {
				refObservableGenerators: [existing.props],
			});
			expect(() => source()).toThrow(MissingReferenceObservableError);
			expect(existing.props.observableGenerator).not.toHaveBeenCalled();
		},
	);

	it('Defer invokes the stored factory per subscription and only forwards explicit child overrides', () => {
		const child = reference('child', ConnectPointPosition.Top);
		const source = creationOperatorFactory.create(
			element(deferOperatorDefinition, {
				observableFactory:
					'function input() { if (arguments.length) throw new Error("unexpected arguments"); return createObservable({ count: 2 }); }',
			}),
			{ refObservableGenerators: [child.props] },
		);
		const observable = source(
			{
				observableFactory: 'function input() { return createObservable({ count: 2 }); }',
			},
			'parent',
		);
		expect(child.props.observableGenerator).not.toHaveBeenCalled();
		expect(child.props.onSubscribe).not.toHaveBeenCalled();
		const actual: FlowValue[] = [];
		observable.subscribe((value) => actual.push(value));
		observable.subscribe((value) => actual.push(value));
		assertForwarded(child, actual);
	});

	it.each([iifOperatorDefinition, deferOperatorDefinition])(
		'evaluates $name callback-producing expressions at factory invocation',
		(definition) => {
			const top = reference('top', ConnectPointPosition.Top);
			const bottom = reference('bottom', ConnectPointPosition.Bottom);
			const expression =
				'(function () { createObservable({ count: 0 }); return function input() { return createObservable({ count: 2 }); }; })()';
			const isIif = definition.type === iifOperatorDefinition.type;
			const source = creationOperatorFactory.create(
				element(
					definition,
					isIif
						? {
								...iifOperatorDefinition.defaults,
								trueCallbackExpression: expression,
								falseCallbackExpression: expression,
							}
						: { observableFactory: expression },
				),
				{ refObservableGenerators: isIif ? [top.props, bottom.props] : [top.props] },
			);
			expect(top.props.observableGenerator).not.toHaveBeenCalled();
			const observable = source();
			expect(top.props.observableGenerator).not.toHaveBeenCalled();
			expect(top.props.onSubscribe).not.toHaveBeenCalled();
			if (isIif) expect(bottom.props.observableGenerator).not.toHaveBeenCalled();
			const actual: FlowValue[] = [];
			observable.subscribe((value) => actual.push(value));
			expect(top.props.observableGenerator.mock.calls.map((call) => call[0])).toEqual([
				{ count: 0 },
				{ count: 2 },
			]);
			expect(actual).toEqual([top.values[1]]);
			expect(actual[0]).toBe(top.values[1]);
			expect(top.props.onSubscribe).toHaveBeenCalledTimes(1);
			expect(bottom.props.onSubscribe).not.toHaveBeenCalled();
		},
	);

	it.each([0, 2])('Defer rejects %i event references', (count) => {
		const child = reference('child', ConnectPointPosition.Top);
		const source = creationOperatorFactory.create(element(deferOperatorDefinition), {
			refObservableGenerators: Array.from({ length: count }, () => child.props),
		});
		expect(() => source()).toThrow(
			count === 0
				? MissingReferenceObservableError
				: 'Too many reference observables for defer operator',
		);
		expect(child.props.observableGenerator).not.toHaveBeenCalled();
	});
});
