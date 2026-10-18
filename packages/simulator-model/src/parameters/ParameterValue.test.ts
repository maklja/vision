import { describe, expect, it } from 'vitest';
import { ElementType } from '../element';
import {
	validateParameterValue,
	validateParameterConstraint,
	wrapParameterProperties,
} from './ParameterValue';

describe('parameter-v1 data contract', () => {
	it.each([
		['number', 0],
		['boolean', false],
		['string', ''],
		['date', -1],
		['json', { nested: [null, 1] }],
	])('accepts an explicit %s literal', (type, value) => {
		expect(() => validateParameterValue({ kind: 'literal', type, value })).not.toThrow();
	});
	it.each([
		{ kind: 'literal', type: 'number', value: '2' },
		{ kind: 'literal', type: 'number', value: null },
		{ kind: 'literal', type: 'number', value: Infinity },
		{ kind: 'literal', type: 'date', value: 1.2 },
		{ kind: 'literal', type: 'date', value: 8.64e15 + 1 },
		{ kind: 'literal', type: 'date', value: new Date() },
		{ kind: 'literal', type: 'json', value: { a: undefined } },
		{ kind: 'expression', type: 'number', source: '1', value: 1 },
		{ kind: 'expression', type: 'number', source: 'é'.repeat(32769) },
		{ kind: 'other', type: 'number', source: '1' },
		{ kind: 'literal', type: 'unknown', value: 1 },
		JSON.parse('{"kind":"literal","type":"json","value":{"__proto__":1}}'),
	])('rejects invalid envelopes without conversion', (value) => {
		expect(() => validateParameterValue(value)).toThrow();
	});
	it('keeps callback strings and intentional optional absence while wrapping numeric fields', () => {
		expect(wrapParameterProperties(ElementType.Range, { start: 0 })).toEqual({
			start: { kind: 'literal', type: 'number', value: 0 },
		});
		const props = { observableFactory: '() => createObservable()' };
		expect(wrapParameterProperties(ElementType.Defer, props)).toEqual(props);
	});
	it.each([
		[ElementType.Range, 'start', -2, true],
		[ElementType.Range, 'start', 1.5, false],
		[ElementType.Range, 'count', -1, false],
		[ElementType.Range, 'count', 0, true],
		[ElementType.Interval, 'period', 0, true],
		[ElementType.Interval, 'period', -1, false],
		[ElementType.Timer, 'intervalDuration', -1, true],
		[ElementType.Timer, 'intervalDuration', -2, false],
	])('enforces %s.%s constraints on %s', (type, field, value, valid) => {
		const check = () => validateParameterConstraint(type, field, value, {});
		if (valid) expect(check).not.toThrow();
		else expect(check).toThrow();
	});
});
