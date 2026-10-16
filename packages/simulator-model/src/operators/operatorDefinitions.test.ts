import { describe, expect, expectTypeOf, it } from 'vitest';
import type { OperatorDefinition } from './OperatorDefinition';
import type { MergeElementProperties } from '../joinCreationOperators/MergeElement';
import type { OfElementProperties } from '../creationOperators/OfElement';
import { ElementType } from '../element/ElementType';
import { findElementDescriptor } from '../descriptors/elementDescriptors';
import { mapToOperatorPropsTemplate } from '../templates/operatorTemplates';
import { mapToCreationOperatorPropsTemplates } from '../templates/creationOperatorTemplates';
import { mapTransformationOperatorTemplates } from '../templates/transformationOperatorTemplates';
import { mapToJoinCreationOperatorPropsTemplates } from '../templates/mapToJoinCreationOperatorPropsTemplates';
import {
	findOperatorDefinition,
	mapOperatorDefinition,
	mergeOperatorDefinition,
	ofOperatorDefinition,
	operatorDefinitions,
	requireOperatorDefinition,
} from './operatorDefinitions';

describe('initial operator definitions', () => {
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

	it('reports missing metadata explicitly without disabling legacy operators', () => {
		expect(findOperatorDefinition(ElementType.From)).toBeUndefined();
		expect(mapToOperatorPropsTemplate(ElementType.From).enableObservableEvent).toBe(true);
		expect(() => requireOperatorDefinition(ElementType.From)).toThrow(
			'Operator metadata is not registered for from',
		);
		expect(findOperatorDefinition('toString' as ElementType)).toBeUndefined();
		expect(() => requireOperatorDefinition('unknown' as ElementType)).toThrow(
			'not registered for unknown',
		);
	});
});
