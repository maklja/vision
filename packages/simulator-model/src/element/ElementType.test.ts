import { describe, expect, it } from 'vitest';
import {
	creationOperators,
	ElementType,
	isEntryOperatorType,
	isPipeOperatorType,
	joinCreationOperators,
} from './ElementType';

describe('ElementType', () => {
	it('classifies creation and join-creation operators as entry operators', () => {
		expect(isEntryOperatorType(ElementType.Of)).toBe(true);
		expect(isEntryOperatorType(ElementType.Merge)).toBe(true);
		expect(creationOperators.has(ElementType.Of)).toBe(true);
		expect(joinCreationOperators.has(ElementType.Merge)).toBe(true);
	});

	it('does not classify pipe or subscriber operators as entry operators', () => {
		expect(isEntryOperatorType(ElementType.Map)).toBe(false);
		expect(isEntryOperatorType(ElementType.Subscriber)).toBe(false);
		expect(isPipeOperatorType(ElementType.Map)).toBe(true);
	});
});
