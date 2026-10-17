import { mapFilteringOperatorPropsTemplates } from '../templates/filteringOperatorTemplates';
import { mapErrorHandlingOperatorPropsTemplates } from '../templates/errorHandlerOperatorTemplates';
import { ObservableInputsType } from '../element/Element';
import type { CombineLatestElementProperties } from '../joinCreationOperators/CombineLatestElement';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { OperatorDefinition } from './OperatorDefinition';
import type { MergeElementProperties } from '../joinCreationOperators/MergeElement';
import type { RangeElementProperties } from '../creationOperators/RangeElement';
import type { FromElementProperties } from '../creationOperators/FromElement';
import { DueDateType } from '../creationOperators/TimerElement';
import type { IifElementProperties } from '../creationOperators/IifElement';
import type { DeferElementProperties } from '../creationOperators/DeferElement';
import type { OfElementProperties } from '../creationOperators/OfElement';
import type { GenerateElementProperties } from '../creationOperators/GenerateElement';
import type { ThrowErrorElementProperties } from '../creationOperators/ThrowErrorElement';
import { AjaxElementProperties, ajaxElementPropsTemplate } from '../creationOperators/AjaxElement';
import { ElementType } from '../element/ElementType';
import { findElementDescriptor } from '../descriptors/elementDescriptors';
import { mapToOperatorPropsTemplate } from '../templates/operatorTemplates';
import { mapToCreationOperatorPropsTemplates } from '../templates/creationOperatorTemplates';
import { mapTransformationOperatorTemplates } from '../templates/transformationOperatorTemplates';
import { mapToJoinCreationOperatorPropsTemplates } from '../templates/mapToJoinCreationOperatorPropsTemplates';
import {
	ajaxOperatorDefinition,
	subscriberOperatorDefinition,
	concatMapOperatorDefinition,
	exhaustMapOperatorDefinition,
	expandOperatorDefinition,
	mergeMapOperatorDefinition,
	bufferOperatorDefinition,
	bufferCountOperatorDefinition,
	bufferTimeOperatorDefinition,
	bufferToggleOperatorDefinition,
	bufferWhenOperatorDefinition,
	combineLatestOperatorDefinition,
	concatOperatorDefinition,
	forkJoinOperatorDefinition,
	raceOperatorDefinition,
	zipOperatorDefinition,
	filterOperatorDefinition,
	catchErrorOperatorDefinition,
	findOperatorDefinition,
	iifOperatorDefinition,
	deferOperatorDefinition,
	fromOperatorDefinition,
	timerOperatorDefinition,
	rangeOperatorDefinition,
	intervalOperatorDefinition,
	mapOperatorDefinition,
	mergeOperatorDefinition,
	emptyOperatorDefinition,
	generateOperatorDefinition,
	throwErrorOperatorDefinition,
	ofOperatorDefinition,
	operatorDefinitions,
	requireOperatorDefinition,
} from './operatorDefinitions';

describe('operator definitions', () => {
	it('requires declared property keys despite the legacy ElementProps index signature', () => {
		expectTypeOf<
			keyof OperatorDefinition<MergeElementProperties>['properties']
		>().toEqualTypeOf<'limitConcurrent'>();
		expectTypeOf<
			keyof OperatorDefinition<OfElementProperties>['properties']
		>().toEqualTypeOf<'argsFactoryExpression'>();
		expectTypeOf<
			OperatorDefinition<MergeElementProperties>['properties']['limitConcurrent']['kind']
		>().toEqualTypeOf<'number'>();
	});

	it.each(Object.values(operatorDefinitions))(
		'preserves $name defaults and connectability',
		(definition) => {
			expect(mapToOperatorPropsTemplate(definition.type)).toBe(definition.defaults);
			expect(findElementDescriptor(definition.type, definition.defaults)).toEqual(
				definition.ports,
			);
			expect(
				Object.entries(definition.properties)
					.filter(
						([key, field]) =>
							!('optional' in field && field.optional) || key in definition.defaults,
					)
					.map(([key]) => key)
					.sort(),
			).toEqual(Object.keys(definition.defaults).sort());
			expect(requireOperatorDefinition(definition.type)).toBe(definition);
		},
	);

	it('routes public group template helpers through the migrated definitions', () => {
		expect(mapToCreationOperatorPropsTemplates(ElementType.Of)).toBe(
			ofOperatorDefinition.defaults,
		);
		expect(mapTransformationOperatorTemplates(ElementType.Map)).toBe(
			mapOperatorDefinition.defaults,
		);
		expect(mapToJoinCreationOperatorPropsTemplates(ElementType.Merge)).toBe(
			mergeOperatorDefinition.defaults,
		);
	});

	it('distinguishes reference inputs from value flow and preserves cardinality', () => {
		expect(ofOperatorDefinition.referencePorts).toEqual(['input']);
		expect(mapOperatorDefinition.referencePorts).toEqual([]);
		expect(mergeOperatorDefinition.referencePorts).toEqual(['input', 'event']);
		expect(mapOperatorDefinition.ports.input?.cardinality).toBe(1);
		expect(mergeOperatorDefinition.ports.event?.cardinality).toBe(Infinity);
		expect(ofOperatorDefinition.ports.event).toBeUndefined();
	});

	it('records callback arguments without claiming helpers or export support', () => {
		expect(ofOperatorDefinition.properties.argsFactoryExpression.signature.arguments).toEqual(
			[],
		);
		expect(
			mapOperatorDefinition.properties.projectExpression.signature.arguments.map(
				({ name }) => name,
			),
		).toEqual(['value', 'index']);
		for (const definition of [ofOperatorDefinition, mapOperatorDefinition]) {
			const [property] = Object.values(definition.properties);
			expect(property.signature.helpers).toEqual([]);
			expect(definition.codeExport.status).toBe('deferred');
		}
	});

	it('distinguishes evaluated expressions from state callbacks and preserves source defaults', () => {
		expectTypeOf<
			OperatorDefinition<
				GenerateElementProperties,
				'initialState'
			>['properties']['initialState']['kind']
		>().toEqualTypeOf<'expression'>();
		expectTypeOf<
			OperatorDefinition<
				GenerateElementProperties,
				'initialState'
			>['properties']['condition']['kind']
		>().toEqualTypeOf<'callback'>();
		expectTypeOf<
			OperatorDefinition<
				ThrowErrorElementProperties,
				'errorOrErrorFactory'
			>['properties']['errorOrErrorFactory']['kind']
		>().toEqualTypeOf<'expression'>();
		expect(generateOperatorDefinition.defaults.initialState).toBe('0');
		expect(generateOperatorDefinition.properties.condition.optional).toBe(true);
		for (const field of [
			generateOperatorDefinition.properties.condition,
			generateOperatorDefinition.properties.iterate,
			generateOperatorDefinition.properties.resultSelector,
		]) {
			expect(field.signature.arguments).toEqual([{ name: 'value', type: 'unknown (state)' }]);
			expect(field.signature.helpers).toEqual([]);
		}
		expect(
			throwErrorOperatorDefinition.properties.errorOrErrorFactory.callback.arguments,
		).toEqual([]);
		expect(
			throwErrorOperatorDefinition.properties.errorOrErrorFactory.callback.helpers,
		).toEqual([]);
		expect(emptyOperatorDefinition.defaults).toEqual({});
		expect(emptyOperatorDefinition.properties).toEqual({});
		for (const definition of [
			emptyOperatorDefinition,
			generateOperatorDefinition,
			throwErrorOperatorDefinition,
		]) {
			expect(mapToCreationOperatorPropsTemplates(definition.type)).toBe(definition.defaults);
			expect(definition.referencePorts).toEqual(['input']);
			expect(definition.ports.event).toBeUndefined();
		}
	});

	it('keeps boolean controls and optional numbers distinct from callbacks at compile time', () => {
		expectTypeOf<
			OperatorDefinition<FromElementProperties>['properties']['enableObservableEvent']['kind']
		>().toEqualTypeOf<'boolean'>();
		expectTypeOf<
			OperatorDefinition<RangeElementProperties>['properties']['count']['kind']
		>().toEqualTypeOf<'number'>();
		expectTypeOf<
			OperatorDefinition<RangeElementProperties>['properties']['count']['optional']
		>().toEqualTypeOf<true>();
	});

	it.each([false, true])(
		'resolves From ports and callback activation for connected mode %s',
		(enabled) => {
			const properties = {
				...fromOperatorDefinition.defaults,
				enableObservableEvent: enabled,
			};
			const ports = fromOperatorDefinition.resolvePorts(properties);
			expect(ports).toEqual(findElementDescriptor(ElementType.From, properties));
			expect(ports.event?.cardinality).toBe(enabled ? 1 : undefined);
			expect(fromOperatorDefinition.properties.observableFactory.activeWhen).toEqual({
				property: 'enableObservableEvent',
				equals: true,
			});
			expect(fromOperatorDefinition.properties.inputCallbackExpression.activeWhen).toEqual({
				property: 'enableObservableEvent',
				equals: false,
			});
			expect(fromOperatorDefinition.properties.observableFactory.signature.helpers).toEqual([
				'createObservable',
			]);
			expect(
				fromOperatorDefinition.properties.inputCallbackExpression.signature.helpers,
			).toEqual([]);
			expect(fromOperatorDefinition.properties.observableFactory.signature.arguments).toEqual(
				[],
			);
			expect(
				fromOperatorDefinition.properties.inputCallbackExpression.signature.arguments,
			).toEqual([]);
		},
	);

	it('preserves source defaults, numeric Timer modes and the one-shot sentinel', () => {
		expect(intervalOperatorDefinition.defaults).toEqual({ period: 1000 });
		expect(rangeOperatorDefinition.defaults).toEqual({ start: 1, count: 10 });
		expect(rangeOperatorDefinition.properties.count.optional).toBe(true);
		expect(timerOperatorDefinition.defaults).toEqual({
			dueDateType: DueDateType.Milliseconds,
			startDue: 1000,
			intervalDuration: -1,
		});
		expect(timerOperatorDefinition.properties.dueDateType.options).toEqual([
			{ value: DueDateType.Milliseconds, label: 'Milliseconds' },
			{ value: DueDateType.Date, label: 'Date' },
		]);
		for (const definition of [
			fromOperatorDefinition,
			intervalOperatorDefinition,
			rangeOperatorDefinition,
			timerOperatorDefinition,
		]) {
			expect(mapToCreationOperatorPropsTemplates(definition.type)).toBe(definition.defaults);
			expect(definition.codeExport.status).toBe('deferred');
		}
	});

	it('describes IIf and Defer callback fields, branch references and helper scope', () => {
		expectTypeOf<keyof OperatorDefinition<IifElementProperties>['properties']>().toEqualTypeOf<
			'conditionExpression' | 'trueCallbackExpression' | 'falseCallbackExpression'
		>();
		expectTypeOf<
			keyof OperatorDefinition<DeferElementProperties>['properties']
		>().toEqualTypeOf<'observableFactory'>();
		expect(iifOperatorDefinition.ports.event?.cardinality).toBe(2);
		expect(deferOperatorDefinition.ports.event?.cardinality).toBe(1);
		expect(iifOperatorDefinition.properties.conditionExpression.signature.helpers).toEqual([]);
		for (const field of [
			iifOperatorDefinition.properties.trueCallbackExpression,
			iifOperatorDefinition.properties.falseCallbackExpression,
			deferOperatorDefinition.properties.observableFactory,
		]) {
			expect(field.signature.arguments).toEqual([]);
			expect(field.signature.helpers).toEqual(['createObservable']);
		}
		expect(iifOperatorDefinition.properties.conditionExpression.signature.arguments).toEqual(
			[],
		);
		for (const definition of [iifOperatorDefinition, deferOperatorDefinition]) {
			expect(definition.referencePorts).toEqual(['input', 'event']);
			expect(definition.ports.input?.cardinality).toBe(1);
			expect(definition.ports.output?.cardinality).toBe(1);
			expect(mapToCreationOperatorPropsTemplates(definition.type)).toBe(definition.defaults);
			expect(definition.codeExport.status).toBe('deferred');
		}
	});

	it.each([
		concatMapOperatorDefinition,
		exhaustMapOperatorDefinition,
		expandOperatorDefinition,
		mergeMapOperatorDefinition,
	])('describes $name project references and optional concurrency', (definition) => {
		expect(mapTransformationOperatorTemplates(definition.type)).toBe(definition.defaults);
		expect(definition.referencePorts).toEqual(['event']);
		expect(definition.ports.event?.cardinality).toBe(1);
		expect(definition.properties.projectExpression.signature.arguments).toEqual([
			{ name: 'value', type: 'unknown (raw)' },
			{ name: 'index', type: 'number' },
		]);
		expect(definition.properties.projectExpression.signature.helpers).toEqual([
			'createObservable',
		]);
		expect(definition.defaults).not.toHaveProperty('concurrent');
		if ('concurrent' in definition.properties)
			expect(definition.properties.concurrent.optional).toBe(true);
	});

	it.each([
		bufferOperatorDefinition,
		bufferCountOperatorDefinition,
		bufferTimeOperatorDefinition,
		bufferToggleOperatorDefinition,
		bufferWhenOperatorDefinition,
	])('describes $name value flow and notifier ports', (definition) => {
		expect(mapTransformationOperatorTemplates(definition.type)).toBe(definition.defaults);
		const notifier =
			definition.type === ElementType.Buffer ||
			definition.type === ElementType.BufferWhen ||
			definition.type === ElementType.BufferToggle;
		expect(definition.referencePorts).toEqual(notifier ? ['event'] : []);
		expect(definition.ports.event?.cardinality).toBe(
			definition.type === ElementType.BufferToggle ? 2 : notifier ? 1 : undefined,
		);
	});
	it('keeps propertyless Buffer and optional BufferTime fields distinct', () => {
		expect(bufferOperatorDefinition.properties).toEqual({});
		expect(bufferOperatorDefinition.defaults).toEqual({});
		expect(bufferCountOperatorDefinition.defaults).toEqual({
			bufferSize: 3,
			startBufferEvery: 2,
		});
		expect(bufferTimeOperatorDefinition.defaults).toEqual({ bufferTimeSpan: 100 });
		expect(bufferTimeOperatorDefinition.properties.bufferCreationInterval.optional).toBe(true);
		expect(bufferTimeOperatorDefinition.properties.maxBufferSize.optional).toBe(true);
		expect(
			bufferToggleOperatorDefinition.properties.closingSelectorExpression.signature.arguments,
		).toEqual([{ name: 'value', type: 'unknown (raw opening value)' }]);
		expect(
			bufferWhenOperatorDefinition.properties.closingSelectorExpression.signature.arguments,
		).toEqual([]);
		for (const definition of [bufferToggleOperatorDefinition, bufferWhenOperatorDefinition])
			expect(definition.properties.closingSelectorExpression.signature.helpers).toEqual([
				'createObservable',
			]);
	});

	it.each([
		combineLatestOperatorDefinition,
		concatOperatorDefinition,
		forkJoinOperatorDefinition,
		raceOperatorDefinition,
		zipOperatorDefinition,
	])('preserves $name reference ports and group defaults', (definition) => {
		expect(mapToJoinCreationOperatorPropsTemplates(definition.type)).toBe(definition.defaults);
		expect(definition.referencePorts).toEqual(['input', 'event']);
		expect(definition.ports.event?.cardinality).toBe(Infinity);
	});
	it('distinguishes string choices from authored callbacks with model-typed option values', () => {
		expectTypeOf<
			OperatorDefinition<CombineLatestElementProperties>['properties']['observableInputsType']['kind']
		>().toEqualTypeOf<'choice'>();
		expectTypeOf<
			OperatorDefinition<CombineLatestElementProperties>['properties']['observableInputsType']['options'][number]['value']
		>().toEqualTypeOf<ObservableInputsType>();
		expectTypeOf<
			OperatorDefinition<OfElementProperties>['properties']['argsFactoryExpression']['kind']
		>().toEqualTypeOf<'callback'>();
		for (const definition of [combineLatestOperatorDefinition, forkJoinOperatorDefinition]) {
			expect(definition.defaults).toEqual({
				observableInputsType: ObservableInputsType.Array,
			});
			expect(definition.properties.observableInputsType.options).toEqual([
				{ value: ObservableInputsType.Array, label: 'Array' },
				{ value: ObservableInputsType.Object, label: 'Object' },
			]);
		}
		for (const definition of [
			concatOperatorDefinition,
			raceOperatorDefinition,
			zipOperatorDefinition,
		])
			expect(definition.properties).toEqual({});
	});

	it('describes Filter raw arguments, absent reference port, and CatchError recovery scope', () => {
		expect(mapFilteringOperatorPropsTemplates(ElementType.Filter)).toBe(
			filterOperatorDefinition.defaults,
		);
		expect(mapErrorHandlingOperatorPropsTemplates(ElementType.CatchError)).toBe(
			catchErrorOperatorDefinition.defaults,
		);
		expect(filterOperatorDefinition.referencePorts).toEqual([]);
		expect(filterOperatorDefinition.ports.event).toBeUndefined();
		expect(
			filterOperatorDefinition.properties.predicateExpression.signature.arguments.map(
				(arg) => arg.name,
			),
		).toEqual(['value', 'index']);
		expect(filterOperatorDefinition.properties.predicateExpression.signature.helpers).toEqual(
			[],
		);
		expect(catchErrorOperatorDefinition.referencePorts).toEqual(['event']);
		expect(catchErrorOperatorDefinition.ports.event?.cardinality).toBe(1);
		expect(
			catchErrorOperatorDefinition.properties.selectorExpression.signature.arguments,
		).toEqual([
			{ name: 'err', type: 'unknown (raw error from FlowValue)' },
			{ name: 'caught', type: 'Observable<unknown> (raw values)' },
		]);
		expect(
			catchErrorOperatorDefinition.properties.selectorExpression.signature.helpers,
		).toEqual(['createObservable']);
		expect(catchErrorOperatorDefinition.properties.selectorExpression.label).toBe('Project');
	});

	it('covers every current operator while excluding internal drawing elements', () => {
		const internal = [ElementType.Result, ElementType.ConnectPoint];
		expect(Object.keys(operatorDefinitions).sort()).toEqual(
			Object.values(ElementType)
				.filter((type) => !internal.includes(type))
				.sort(),
		);
		for (const type of internal) {
			expect(findOperatorDefinition(type)).toBeUndefined();
			expect(() => requireOperatorDefinition(type)).toThrow('not registered');
		}
	});
	it('types literal text and pair lists without changing callbacks or stored defaults', () => {
		type Fields = OperatorDefinition<
			AjaxElementProperties,
			never,
			'url' | 'body'
		>['properties'];
		expectTypeOf<Fields['url']['kind']>().toEqualTypeOf<'text'>();
		expectTypeOf<Fields['body']['kind']>().toEqualTypeOf<'text'>();
		expectTypeOf<Fields['headers']['kind']>().toEqualTypeOf<'pairs'>();
		expectTypeOf<Fields['queryParams']['kind']>().toEqualTypeOf<'pairs'>();
		expect(ajaxOperatorDefinition.defaults).toBe(ajaxElementPropsTemplate);
		expect(Object.keys(ajaxOperatorDefinition.defaults).sort()).toEqual(['method', 'url']);
		expect(ajaxOperatorDefinition.properties.body.format).toBe('json');
		expect(subscriberOperatorDefinition.ports.input?.cardinality).toBe(1);
		expect('output' in subscriberOperatorDefinition.ports).toBe(false);
		expect('event' in subscriberOperatorDefinition.ports).toBe(false);
		expect(subscriberOperatorDefinition.referencePorts).toEqual([]);
	});
	it('reports unknown metadata explicitly', () => {
		expect(findOperatorDefinition('toString' as ElementType)).toBeUndefined();
		expect(() => requireOperatorDefinition('unknown' as ElementType)).toThrow(
			'not registered for unknown',
		);
	});
});
