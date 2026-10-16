import { describe, expect, expectTypeOf, it } from 'vitest';
import type { OperatorDefinition } from './OperatorDefinition';
import type { MergeElementProperties } from '../joinCreationOperators/MergeElement';
import type { RangeElementProperties } from '../creationOperators/RangeElement';
import type { FromElementProperties } from '../creationOperators/FromElement';
import { DueDateType } from '../creationOperators/TimerElement';
import type { IifElementProperties } from '../creationOperators/IifElement';
import type { DeferElementProperties } from '../creationOperators/DeferElement';
import type { OfElementProperties } from '../creationOperators/OfElement';
import { ElementType } from '../element/ElementType';
import { findElementDescriptor } from '../descriptors/elementDescriptors';
import { mapToOperatorPropsTemplate } from '../templates/operatorTemplates';
import { mapToCreationOperatorPropsTemplates } from '../templates/creationOperatorTemplates';
import { mapTransformationOperatorTemplates } from '../templates/transformationOperatorTemplates';
import { mapToJoinCreationOperatorPropsTemplates } from '../templates/mapToJoinCreationOperatorPropsTemplates';
import {
	findOperatorDefinition,
	iifOperatorDefinition,
	deferOperatorDefinition,
	fromOperatorDefinition,
	timerOperatorDefinition,
	rangeOperatorDefinition,
	intervalOperatorDefinition,
	mapOperatorDefinition,
	mergeOperatorDefinition,
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
			expect(Object.keys(definition.properties).sort()).toEqual(
				Object.keys(definition.defaults).sort(),
			);
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

	it('reports missing metadata explicitly without disabling legacy operators', () => {
		expect(findOperatorDefinition(ElementType.Empty)).toBeUndefined();
		expect(mapToOperatorPropsTemplate(ElementType.Empty)).toEqual({});
		expect(() => requireOperatorDefinition(ElementType.Empty)).toThrow(
			'Operator metadata is not registered for empty',
		);
		expect(findOperatorDefinition('toString' as ElementType)).toBeUndefined();
		expect(() => requireOperatorDefinition('unknown' as ElementType)).toThrow(
			'not registered for unknown',
		);
	});
});
