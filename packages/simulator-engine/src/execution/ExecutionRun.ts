import { parse } from 'acorn';
import { from, ObservableInput } from 'rxjs';
import {
	Element,
	ElementProps,
	ElementType,
	PropertyDefinition,
	requireOperatorDefinition,
	resultOperators,
	validateJsonData,
} from '@maklja/vision-simulator-model';

export interface ExecutionDiagnostic {
	category:
		| 'schema'
		| 'reference'
		| 'compile'
		| 'shape'
		| 'result'
		| 'invocation'
		| 'transport'
		| 'watchdog'
		| 'policy';
	phase: 'preflight' | 'subscription' | 'callback' | 'host';
	runId: string;
	elementId?: string;
	field?: string;
	subscriptionId?: string;
	message: string;
	omittedCount?: number;
}
export class ExecutionError extends Error {
	constructor(public readonly diagnostic: ExecutionDiagnostic) {
		super(diagnostic.message);
	}
}
const encoder = new TextEncoder();
export function cloneInvocation<T>(value: T): T {
	validateJsonData(value);
	const json = JSON.stringify(value);
	if (encoder.encode(json).length > 1024 * 1024) throw new Error('JSON snapshot exceeds 1 MiB');
	return JSON.parse(json) as T;
}
function freeze<T>(value: T): T {
	if (value && typeof value === 'object') {
		Object.values(value).forEach(freeze);
		Object.freeze(value);
	}
	return value;
}
export function cloneContextSeed(seed: unknown): ElementProps {
	if (!seed || typeof seed !== 'object' || Array.isArray(seed))
		throw new Error('contextSeed must be a finite JSON object');
	return cloneInvocation(seed as ElementProps);
}
function fields(el: Element) {
	return requireOperatorDefinition(el.type).properties as Record<
		string,
		PropertyDefinition & {
			optional?: boolean;
			activeWhen?: { property: string; equals: boolean };
		}
	>;
}
/** Match invocation defaults without evaluating authored source or filling optional fields. */
function propertiesWithDefaults(el: Element): ElementProps {
	const defaults: ElementProps = requireOperatorDefinition(el.type).defaults;
	const properties: ElementProps = {};
	for (const [key, definition] of Object.entries(fields(el))) {
		if (Object.hasOwn(el.properties, key)) properties[key] = el.properties[key];
		else if (!definition.optional) properties[key] = defaults[key];
	}
	return properties;
}
function active(
	field: { activeWhen?: { property: string; equals: boolean } },
	properties: ElementProps,
) {
	return !field.activeWhen || properties[field.activeWhen.property] === field.activeWhen.equals;
}
/** Parser only: authored code is never evaluated during syntax preflight. */
export function validateSource(el: Element, field: string, source: unknown, callback: boolean) {
	if (typeof source !== 'string' || !source.trim())
		throw new Error('Expected nonempty JavaScript source');
	if (encoder.encode(source).length > 65536) throw new Error('Source exceeds 64 KiB');
	const ast = parse(`(${source}\n)`, { ecmaVersion: 'latest' });
	const expression = ast.body[0];
	if (
		callback &&
		expression.type === 'ExpressionStatement' &&
		expression.expression.type === 'Literal'
	)
		throw new Error(`${el.id}.${field}: expected a function, not a literal`);
}
export function preflight(elements: readonly Element[]) {
	for (const el of elements) {
		if (resultOperators.has(el.type)) continue;
		const properties = propertiesWithDefaults(el);
		for (const [field, definition] of Object.entries(fields(el))) {
			if (!active(definition, properties)) continue;
			if (definition.optional && properties[field] === undefined) continue;
			if (definition.kind === 'callback' || definition.kind === 'expression') {
				try {
					validateSource(el, field, properties[field], definition.kind === 'callback');
				} catch {
					throw new ExecutionError({
						category: 'compile',
						phase: 'preflight',
						runId: '',
						elementId: el.id,
						field,
						message: `Invalid JavaScript or function shape in ${field}`,
					});
				}
			}
		}
	}
}
export function requiresTrustedWorker(elements: readonly Element[], seed: ElementProps = {}) {
	return (
		Object.keys(seed).length > 0 ||
		elements
			.filter((el) => !resultOperators.has(el.type))
			.some((el) => {
				const properties = propertiesWithDefaults(el);
				return (
					el.type === ElementType.Ajax ||
					Object.values(fields(el)).some(
						(d) =>
							active(d, properties) &&
							(d.kind === 'callback' || d.kind === 'expression'),
					)
				);
			})
	);
}

/** One instance per run; never cached in a module or persisted. */
export class ExecutionRun {
	readonly context: ElementProps;
	constructor(
		readonly runId: string = crypto.randomUUID(),
		seed: unknown = {},
		private readonly report?: (d: ExecutionDiagnostic) => void,
	) {
		this.context = cloneContextSeed(seed);
	}
	fail(
		el: Element,
		field: string,
		category: ExecutionDiagnostic['category'],
		phase: ExecutionDiagnostic['phase'],
		subscriptionId?: string,
	): never {
		const diagnostic: ExecutionDiagnostic = {
			runId: this.runId,
			elementId: el.id,
			field,
			category,
			phase,
			subscriptionId,
			message: `${category} error in ${field}`,
		};
		this.report?.(diagnostic);
		throw new ExecutionError(diagnostic);
	}
	resolve(el: Element, overrides?: ElementProps): Element {
		const definitions = fields(el);
		try {
			if (
				overrides !== undefined &&
				(!overrides || typeof overrides !== 'object' || Array.isArray(overrides))
			)
				throw new Error();
			for (const [key, descriptor] of Object.entries(
				Object.getOwnPropertyDescriptors(overrides ?? {}),
			)) {
				if (
					descriptor.get ||
					descriptor.set ||
					descriptor.value === undefined ||
					(typeof descriptor.value === 'number' && !Number.isFinite(descriptor.value))
				)
					this.fail(el, key, 'schema', 'subscription');
			}
			cloneInvocation(overrides ?? {});
		} catch (error) {
			if (error instanceof ExecutionError) throw error;
			this.fail(el, 'overrides', 'schema', 'subscription');
		}
		const defaults = propertiesWithDefaults(el);
		const properties: ElementProps = {};
		for (const key of Object.keys(el.properties))
			if (!Object.hasOwn(definitions, key)) this.fail(el, key, 'schema', 'subscription');
		for (const key of Object.keys(overrides ?? {}))
			if (!Object.hasOwn(definitions, key)) this.fail(el, key, 'schema', 'subscription');
		for (const [key, definition] of Object.entries(definitions)) {
			const present =
				Object.hasOwn(overrides ?? {}, key) || Object.hasOwn(el.properties, key);
			const value = Object.hasOwn(overrides ?? {}, key) ? overrides![key] : defaults[key];
			if (!present && definition.optional) continue;
			const valid =
				definition.kind === 'number'
					? typeof value === 'number' && Number.isFinite(value)
					: definition.kind === 'boolean'
						? typeof value === 'boolean'
						: definition.kind === 'pairs'
							? Array.isArray(value) &&
								value.every(
									(p) =>
										Array.isArray(p) &&
										p.length === 2 &&
										p.every((v) => typeof v === 'string'),
								)
							: typeof value === 'string';
			if (!valid || value === null || value === undefined)
				this.fail(el, key, 'schema', 'subscription');
			if (
				definition.kind === 'choice' &&
				!definition.options.some((o) => o.value === value) &&
				!(el.type === ElementType.Ajax && key === 'responseType' && value === '')
			)
				this.fail(el, key, 'schema', 'subscription');
			if (
				definition.kind === 'number' &&
				definition.options &&
				!definition.options.some((o) => o.value === value)
			)
				this.fail(el, key, 'schema', 'subscription');
			properties[key] = value;
		}
		const numeric = (key: string, valid: (v: number) => boolean) => {
			if (properties[key] !== undefined && !valid(properties[key] as number))
				this.fail(el, key, 'schema', 'subscription');
		};
		if (el.type === ElementType.Range) {
			numeric('start', Number.isInteger);
			numeric('count', (v) => Number.isInteger(v) && v >= 0);
		}
		if (el.type === ElementType.Interval) numeric('period', (v) => v >= 0);
		if (el.type === ElementType.Timer) {
			numeric('startDue', (v) =>
				properties.dueDateType === 1
					? Number.isInteger(v) && Math.abs(v) <= 8.64e15
					: v >= 0,
			);
			numeric('intervalDuration', (v) => v >= 0 || v === -1);
		}
		const result = { ...el, properties: freeze(cloneInvocation(properties)) };
		try {
			preflight([result]);
		} catch (error) {
			if (error instanceof ExecutionError) {
				const diagnostic = {
					...error.diagnostic,
					runId: this.runId,
					phase: 'subscription' as const,
				};
				this.report?.(diagnostic);
				throw new ExecutionError(diagnostic);
			}
			throw error;
		}
		return result;
	}
	evaluate(el: Element, field: string, helper?: unknown, subscriptionId?: string): unknown {
		const definition = fields(el)[field];
		try {
			validateSource(el, field, el.properties[field], definition.kind === 'callback');
		} catch {
			return this.fail(el, field, 'compile', 'subscription', subscriptionId);
		}
		try {
			return new Function(
				'$context',
				'$params',
				...(helper ? ['createObservable'] : []),
				`"use strict"; return (${el.properties[field]}\n);`,
			)(this.context, el.properties, ...(helper ? [helper] : []));
		} catch (error) {
			this.report?.({
				runId: this.runId,
				elementId: el.id,
				field,
				subscriptionId,
				category: 'invocation',
				phase: 'subscription',
				message: `Expression exception in ${field}`,
			});
			throw error;
		}
	}

	callback(
		el: Element,
		field: string,
		helper?: unknown,
		subscriptionId?: string,
	): (...args: unknown[]) => unknown {
		const fn = this.evaluate(el, field, helper, subscriptionId);
		if (typeof fn !== 'function') this.fail(el, field, 'shape', 'subscription', subscriptionId);
		return (...args: unknown[]) => {
			let result: unknown;
			try {
				result = Reflect.apply(fn, undefined, args);
			} catch (error) {
				if (error instanceof ExecutionError) throw error;
				this.report?.({
					category: 'invocation',
					phase: 'callback',
					runId: this.runId,
					elementId: el.id,
					field,
					subscriptionId,
					message: `Callback exception in ${field}`,
				});
				throw error;
			}
			const def = fields(el)[field];
			const signature =
				def.kind === 'callback'
					? def.signature
					: def.kind === 'expression'
						? def.callback
						: undefined;
			if (signature?.returns.includes('Observable')) {
				try {
					return from(result as ObservableInput<unknown>);
				} catch {
					return this.fail(el, field, 'result', 'callback', subscriptionId);
				}
			}
			return result;
		};
	}
}
