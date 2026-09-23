import { describe, expect, it } from 'vitest';
import {
	connectPointOperators,
	creationOperators,
	errorHandlerOperators,
	ElementType,
	eventPipeOperators,
	filteringOperators,
	isConnectPointType,
	isCreationOperatorType,
	isEntryOperatorType,
	isErrorHandlerType,
	isEventPipeOperatorType,
	isJoinCreationOperatorType,
	isPipeOperatorType,
	isResultOperatorType,
	isSubscriberType,
	joinCreationOperators,
	pipeOperators,
	resultOperators,
	subscriberOperators,
	transformationOperators,
} from './ElementType';
import { ElementGroup, mapElementGroupToTypes, mapElementTypeToGroup } from './ElementGroup';

const expectedTypesByGroup = new Map<ElementGroup, ElementType[]>([
	[
		ElementGroup.Creation,
		[
			ElementType.Of,
			ElementType.From,
			ElementType.IIf,
			ElementType.Interval,
			ElementType.Ajax,
			ElementType.Empty,
			ElementType.Defer,
			ElementType.Generate,
			ElementType.Range,
			ElementType.ThrowError,
			ElementType.Timer,
		],
	],
	[
		ElementGroup.JoinCreation,
		[
			ElementType.CombineLatest,
			ElementType.Merge,
			ElementType.Concat,
			ElementType.ForkJoin,
			ElementType.Race,
			ElementType.Zip,
		],
	],
	[
		ElementGroup.Transformation,
		[
			ElementType.Buffer,
			ElementType.BufferCount,
			ElementType.BufferTime,
			ElementType.BufferToggle,
			ElementType.BufferWhen,
			ElementType.ConcatMap,
			ElementType.ExhaustMap,
			ElementType.Expand,
			ElementType.MergeMap,
			ElementType.Map,
		],
	],
	[ElementGroup.Filtering, [ElementType.Filter]],
	[ElementGroup.ErrorHandling, [ElementType.CatchError]],
	[ElementGroup.Subscriber, [ElementType.Subscriber]],
	[ElementGroup.Result, [ElementType.Result]],
	[ElementGroup.ConnectPoint, [ElementType.ConnectPoint]],
]);

describe('ElementType', () => {
	it('keeps every element type in exactly one primary group', () => {
		const groupedTypes = [...expectedTypesByGroup.values()].flat();

		expect(groupedTypes).toHaveLength(Object.values(ElementType).length);
		expect(new Set(groupedTypes).size).toBe(groupedTypes.length);

		for (const [group, expectedTypes] of expectedTypesByGroup) {
			expect(mapElementGroupToTypes(group)).toEqual(new Set(expectedTypes));

			for (const type of expectedTypes) {
				expect(mapElementTypeToGroup(type)).toBe(group);
			}
		}
	});

	it('returns no types for operator groups that are not implemented yet', () => {
		for (const group of [
			ElementGroup.Join,
			ElementGroup.Multicasting,
			ElementGroup.Utility,
			ElementGroup.Conditional,
			ElementGroup.Mathematical,
		]) {
			expect(mapElementGroupToTypes(group)).toEqual(new Set());
		}
	});

	it('classifies every current element type through the public helpers', () => {
		for (const type of Object.values(ElementType)) {
			expect(isCreationOperatorType(type)).toBe(creationOperators.has(type));
			expect(isJoinCreationOperatorType(type)).toBe(joinCreationOperators.has(type));
			expect(isPipeOperatorType(type)).toBe(pipeOperators.has(type));
			expect(isEventPipeOperatorType(type)).toBe(eventPipeOperators.has(type));
			expect(isSubscriberType(type)).toBe(subscriberOperators.has(type));
			expect(isErrorHandlerType(type)).toBe(errorHandlerOperators.has(type));
			expect(isResultOperatorType(type)).toBe(resultOperators.has(type));
			expect(isConnectPointType(type)).toBe(connectPointOperators.has(type));
			expect(isEntryOperatorType(type)).toBe(
				creationOperators.has(type) || joinCreationOperators.has(type),
			);
		}
	});

	it('builds the pipe families from transformation, filtering, and error operators', () => {
		expect(pipeOperators).toEqual(
			new Set([...transformationOperators, ...filteringOperators, ...errorHandlerOperators]),
		);
		expect(eventPipeOperators).toEqual(
			new Set([
				ElementType.CatchError,
				ElementType.Buffer,
				ElementType.BufferToggle,
				ElementType.BufferWhen,
				ElementType.ExhaustMap,
				ElementType.Expand,
				ElementType.IIf,
				ElementType.Defer,
				ElementType.From,
				ElementType.ConcatMap,
				ElementType.MergeMap,
			]),
		);
	});

	it('rejects an unknown element type when resolving its group', () => {
		expect(() => mapElementTypeToGroup('unknown' as ElementType)).toThrow(
			'Unknown element group for element type unknown',
		);
	});
});
