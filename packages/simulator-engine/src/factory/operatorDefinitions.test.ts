import { describe, expect, it } from 'vitest';
import { of, toArray } from 'rxjs';
import {
	Element,
	ElementType,
	mapOperatorDefinition,
	ofOperatorDefinition,
	mapToOperatorPropsTemplate,
} from '@maklja/vision-simulator-model';
import { creationOperatorFactory } from './creationOperatorFactory';
import { joinCreationOperatorFactory } from './joinCreationOperatorFactory';
import { transformationOperatorFactory } from './transformationOperatorFactory';
import { filteringOperatorFactory } from './filteringOperatorFactory';
import { errorHandlingOperatorFactory } from './errorHandlingOperatorFactory';
import { FlowValue } from '../context';

function element(type: ElementType, properties = mapToOperatorPropsTemplate(type)): Element {
	return { id: 'operator', type, properties, name: type, x: 0, y: 0, visible: true };
}

const props = { refObservableGenerators: [] };

describe('operator metadata engine compatibility', () => {
	it('has exactly one execution registration for every executable current ElementType', () => {
		const factories = [
			creationOperatorFactory,
			joinCreationOperatorFactory,
			transformationOperatorFactory,
			filteringOperatorFactory,
			errorHandlingOperatorFactory,
		];
		const nonFactoryTypes = new Set([
			ElementType.Subscriber,
			ElementType.Result,
			ElementType.ConnectPoint,
		]);
		for (const type of Object.values(ElementType)) {
			const expected = nonFactoryTypes.has(type) ? 0 : 1;
			expect(
				factories.filter((factory) => factory.isSupported(element(type))),
				type,
			).toHaveLength(expected);
		}
	});

	it('runs the migrated Of defaults and preserves scalar-versus-array behavior', () => {
		const source = creationOperatorFactory.create(element(ofOperatorDefinition.type), props);
		const values: unknown[] = [];
		source().subscribe((value) => values.push(value.raw));
		expect(values).toEqual([1, 2, 3, 4]);
		const scalar: unknown[] = [];
		source({ argsFactoryExpression: 'function () { return { value: 7 }; }' }).subscribe(
			(value) => scalar.push(value.raw),
		);
		expect(scalar).toEqual([{ value: 7 }]);
	});

	it('preserves raw-value arguments, per-value index zero and FlowValue identity for Map', () => {
		const inputs = [1, 2, 3].map((value) =>
			FlowValue.createNextEvent({ elementId: 'source', value }),
		);
		const project = transformationOperatorFactory.create(
			element(mapOperatorDefinition.type, {
				projectExpression: 'function (value, index) { return [value * 10, index]; }',
			}),
			props,
		);
		let output: FlowValue[] = [];
		project(of(...inputs))
			.pipe(toArray())
			.subscribe((values) => {
				output = values;
			});
		expect(output.map((value) => value.raw)).toEqual([
			[10, 0],
			[20, 0],
			[30, 0],
		]);
		expect(output.map((value) => value.id)).toEqual(inputs.map((value) => value.id));
	});
});
