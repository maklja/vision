import { OfElementProperties, ofElementPropsTemplate } from '../creationOperators/OfElement';
import {
	creationElementDescriptor,
	joinCreationElementDescriptor,
	pipeElementDescriptor,
} from '../descriptors/elementDescriptors';
import { ElementGroup } from '../element/ElementGroup';
import { ElementType } from '../element/ElementType';
import {
	MergeElementProperties,
	mergeElementPropsTemplate,
} from '../joinCreationOperators/MergeElement';
import {
	MapElementProperties,
	mapElementPropsTemplate,
} from '../transformationOperators/MapElement';
import type { OperatorDefinition } from './OperatorDefinition';

const codeExport = {
	status: 'deferred',
	reason: 'Readable RxJS serializers are tracked in #136.',
} as const;

export const ofOperatorDefinition = {
	type: ElementType.Of,
	name: 'of',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/of',
	status: 'supported',
	defaults: ofElementPropsTemplate,
	properties: {
		argsFactoryExpression: {
			kind: 'callback',
			label: 'Arguments factory',
			signature: {
				arguments: [],
				returns: 'unknown | unknown[]',
				helpers: [],
				notes: 'Called without arguments per factory invocation. Arrays emit each item; a non-array emits once.',
			},
		},
	},
	ports: creationElementDescriptor,
	referencePorts: ['input'],
	example: 'argsFactoryExpression: function argsFactory() { return [1, 2, 3, 4]; }',
	codeExport,
} as const satisfies OperatorDefinition<OfElementProperties>;

export const mapOperatorDefinition = {
	type: ElementType.Map,
	name: 'map',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/map',
	status: 'supported',
	defaults: mapElementPropsTemplate,
	properties: {
		projectExpression: {
			kind: 'callback',
			label: 'Project',
			signature: {
				arguments: [
					{ name: 'value', type: 'unknown (raw)' },
					{ name: 'index', type: 'number' },
				],
				returns: 'unknown',
				helpers: [],
				notes: 'The current adapter applies map to a one-value observable for each input: index is always 0. Preserve this behavior until #134 explicitly changes it.',
			},
		},
	},
	ports: pipeElementDescriptor,
	referencePorts: [],
	example: 'projectExpression: function project(value, index) { return value; }',
	codeExport,
} as const satisfies OperatorDefinition<MapElementProperties>;

export const mergeOperatorDefinition = {
	type: ElementType.Merge,
	name: 'merge',
	category: ElementGroup.JoinCreation,
	documentationUrl: 'https://rxjs.dev/api/index/function/merge',
	status: 'supported',
	defaults: mergeElementPropsTemplate,
	properties: {
		limitConcurrent: {
			kind: 'number',
			label: 'Limit concurrent',
			semantics:
				'Values > 0 supply the RxJS concurrency argument; 0 or a negative value omits it (unbounded).',
		},
	},
	ports: joinCreationElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'Connect two of sources to event inputs; limitConcurrent: 0 merges both inputs without a concurrency cap.',
	codeExport,
} as const satisfies OperatorDefinition<MergeElementProperties>;

/** Only migrated operators belong here. Absence must not be interpreted as unsupported execution. */
export const operatorDefinitions = {
	[ElementType.Of]: ofOperatorDefinition,
	[ElementType.Map]: mapOperatorDefinition,
	[ElementType.Merge]: mergeOperatorDefinition,
} as const;

export function findOperatorDefinition(type: ElementType) {
	return Object.prototype.hasOwnProperty.call(operatorDefinitions, type)
		? operatorDefinitions[type as keyof typeof operatorDefinitions]
		: undefined;
}

/** For consumers that require metadata; never silently substitute an empty definition. */
export function requireOperatorDefinition(type: ElementType) {
	const definition = findOperatorDefinition(type);
	if (!definition) {
		throw new Error(
			`Operator metadata is not registered for ${type}; see OPERATOR_DEFINITIONS.md (#140).`,
		);
	}
	return definition;
}
