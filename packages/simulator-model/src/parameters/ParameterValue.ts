import { ElementProps, ElementType } from '../element';
import { validateJsonData } from '../diagram/diagramDocument';

export type JsonValue =
	null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type ParameterType = 'number' | 'boolean' | 'string' | 'date' | 'json';
export type ParameterValue =
	| { kind: 'literal'; type: ParameterType; value: JsonValue }
	| { kind: 'expression'; type: ParameterType; source: string };
/** Raw numbers remain supported at the engine API boundary; schema v2 stores envelopes only. */
export type NumericParameter = number | ParameterValue;

export function isParameterValue(value: unknown): value is ParameterValue {
	return !!value && typeof value === 'object' && 'kind' in value;
}

export function parameterTypeForField(
	type: ElementType,
	field: string,
	props: ElementProps,
): ParameterType | undefined {
	if (type === ElementType.Range && ['start', 'count'].includes(field)) return 'number';
	if (type === ElementType.Interval && field === 'period') return 'number';
	if (type === ElementType.Timer) {
		if (field === 'startDue') return props.dueDateType === 1 ? 'date' : 'number';
		if (field === 'intervalDuration') return 'number';
	}
	return undefined;
}

export function validateParameterResult(type: ParameterType, value: unknown): void {
	validateJsonData(value);
	if (new TextEncoder().encode(JSON.stringify(value)).length > 1024 * 1024)
		throw new Error('Parameter exceeds 1 MiB');
	const valid =
		type === 'json' ||
		(type === 'number' && typeof value === 'number' && Number.isFinite(value)) ||
		(type === 'date' &&
			typeof value === 'number' &&
			Number.isInteger(value) &&
			Math.abs(value) <= 8.64e15) ||
		(type === 'boolean' && typeof value === 'boolean') ||
		(type === 'string' && typeof value === 'string');
	if (!valid) throw new Error(`Expected a ${type} parameter result without coercion`);
}

/** Envelope validation is inert; source syntax and execution belong to the engine. */
export function validateParameterValue(
	value: unknown,
	expected?: ParameterType,
): asserts value is ParameterValue {
	validateJsonData(value);
	if (
		!isParameterValue(value) ||
		!['number', 'boolean', 'string', 'date', 'json'].includes(value.type)
	)
		throw new Error('Expected a parameter-v1 envelope');
	if (expected && value.type !== expected) throw new Error(`Expected parameter type ${expected}`);
	const allowed =
		value.kind === 'literal' ? ['kind', 'type', 'value'] : ['kind', 'type', 'source'];
	if (Object.keys(value).some((key) => !allowed.includes(key)))
		throw new Error('Unknown parameter field');
	if (value.kind === 'literal') validateParameterResult(value.type, value.value);
	else if (
		value.kind !== 'expression' ||
		typeof value.source !== 'string' ||
		new TextEncoder().encode(value.source).length > 65536
	)
		throw new Error('Expected expression source at most 64 KiB');
}

export function validateParameterConstraint(
	type: ElementType,
	field: string,
	value: unknown,
	props: ElementProps,
): void {
	const expected = parameterTypeForField(type, field, props);
	if (!expected) return;
	validateParameterResult(expected, value);
	const n = value as number;
	if (
		(type === ElementType.Range && (!Number.isInteger(n) || (field === 'count' && n < 0))) ||
		(type === ElementType.Interval && n < 0) ||
		(type === ElementType.Timer &&
			((field === 'startDue' && expected === 'number' && n < 0) ||
				(field === 'intervalDuration' && n < 0 && n !== -1)))
	)
		throw new Error(`Invalid ${field} parameter`);
}

/** Convert registered raw numeric fields only; callbacks and optional absence stay unchanged. */
export function wrapParameterProperties(type: ElementType, props: ElementProps): ElementProps {
	return Object.fromEntries(
		Object.entries(props).map(([key, value]) => {
			const parameterType = parameterTypeForField(type, key, props);
			return [
				key,
				parameterType && typeof value === 'number'
					? { kind: 'literal', type: parameterType, value }
					: value,
			];
		}),
	);
}
