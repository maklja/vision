import {
	combineLatest,
	concat,
	defer,
	forkJoin,
	map,
	merge,
	ObservableInput,
	race,
	zip,
} from 'rxjs';
import {
	CombineLatestElement,
	Element,
	ElementGroup,
	ElementProps,
	ElementType,
	ForkJoinElement,
	MergeElement,
	MergeElementProperties,
	ObservableInputsType,
} from '@maklja/vision-simulator-model';
import {
	CreationObservableFactory,
	JoinCreationOperatorFactory,
	ObservableGeneratorProps,
	OperatorProps,
} from './OperatorFactory';
import { FlowValue } from '../context';
import { UnsupportedElementTypeError } from '../errors';
import { createFlowValue, mapFlowValuesArray } from './utils';

type JoinCreationOperatorFunctionFactory = (
	el: Element,
	props: OperatorProps,
) => CreationObservableFactory;

function createIndexedObservableInput(
	id: string,
	observableGeneratorProps: readonly ObservableGeneratorProps[],
	overrideProperties?: Partial<ElementProps>,
) {
	return observableGeneratorProps.map((observableGeneratorProp) =>
		defer(() => {
			observableGeneratorProp.onSubscribe?.(FlowValue.createEmptyValue(id));
			return observableGeneratorProp.observableGenerator(overrideProperties);
		}),
	);
}

function createNamedObservableInput(
	id: string,
	observableGeneratorProps: readonly ObservableGeneratorProps[],
	overrideProperties?: Partial<ElementProps>,
): Record<string, ObservableInput<unknown>> {
	return observableGeneratorProps.reduce(
		(namedObservableInput, observableGeneratorProp) => ({
			...namedObservableInput,
			[observableGeneratorProp.connectLine.name]: defer(() => {
				observableGeneratorProp.onSubscribe?.(FlowValue.createEmptyValue(id));
				return observableGeneratorProp.observableGenerator(overrideProperties);
			}),
		}),
		{},
	);
}

const createMergeOperator =
	(el: Element, props: OperatorProps) => (overrideProperties?: Partial<ElementProps>) => {
		const mergeEl = el as MergeElement;
		const mergeElProperties: MergeElementProperties = {
			...mergeEl.properties,
			...overrideProperties,
		};

		return merge<FlowValue[]>(
			...props.refObservableGenerators.map(
				(refObservableGenerator) =>
					defer(() => {
						refObservableGenerator.onSubscribe?.(FlowValue.createEmptyValue(el.id));
						return refObservableGenerator.observableGenerator();
					}),
				mergeElProperties.limitConcurrent > 0
					? mergeElProperties.limitConcurrent
					: undefined,
			),
		);
	};

const createCombineLatestOperator =
	(el: Element, props: OperatorProps) => (overrideProperties?: Partial<ElementProps>) => {
		const combineLatestEl = el as CombineLatestElement;

		if (combineLatestEl.properties.observableInputsType === ObservableInputsType.Array) {
			return combineLatest<FlowValue[]>(
				createIndexedObservableInput(
					combineLatestEl.id,
					props.refObservableGenerators,
					overrideProperties,
				),
			).pipe(mapFlowValuesArray(combineLatestEl.id));
		}

		return combineLatest<Record<string, ObservableInput<unknown>>>(
			createNamedObservableInput(
				combineLatestEl.id,
				props.refObservableGenerators,
				overrideProperties,
			),
		).pipe(map((value) => createFlowValue(value, combineLatestEl.id)));
	};

const createConcatOperator =
	(el: Element, props: OperatorProps) => (overrideProperties?: Partial<ElementProps>) => {
		return concat<FlowValue[]>(
			...props.refObservableGenerators.map((refObservableGenerator) =>
				defer(() => {
					refObservableGenerator.onSubscribe?.(FlowValue.createEmptyValue(el.id));
					return refObservableGenerator.observableGenerator(overrideProperties);
				}),
			),
		);
	};

const createForkJoinOperator =
	(el: Element, props: OperatorProps) => (overrideProperties?: Partial<ElementProps>) => {
		const forkJoinEl = el as ForkJoinElement;

		if (forkJoinEl.properties.observableInputsType === ObservableInputsType.Array) {
			return forkJoin<FlowValue[]>(
				createIndexedObservableInput(
					forkJoinEl.id,
					props.refObservableGenerators,
					overrideProperties,
				),
			).pipe(mapFlowValuesArray(forkJoinEl.id));
		}

		return forkJoin<Record<string, ObservableInput<unknown>>>(
			createNamedObservableInput(
				forkJoinEl.id,
				props.refObservableGenerators,
				overrideProperties,
			),
		).pipe(map((value) => createFlowValue(value, forkJoinEl.id)));
	};

const createRaceOperator =
	(el: Element, props: OperatorProps) => (overrideProperties?: Partial<ElementProps>) => {
		return race<FlowValue[]>(
			props.refObservableGenerators.map((refObservableGenerator) =>
				defer(() => {
					refObservableGenerator.onSubscribe?.(FlowValue.createEmptyValue(el.id));
					return refObservableGenerator.observableGenerator(overrideProperties);
				}),
			),
		);
	};

const createZipOperator =
	(el: Element, props: OperatorProps) => (overrideProperties?: Partial<ElementProps>) => {
		return zip<FlowValue[]>(
			props.refObservableGenerators.map((refObservableGenerator) =>
				defer(() => {
					refObservableGenerator.onSubscribe?.(FlowValue.createEmptyValue(el.id));
					return refObservableGenerator.observableGenerator(overrideProperties);
				}),
			),
		).pipe(mapFlowValuesArray(el.id));
	};

const supportedOperators: ReadonlyMap<ElementType, JoinCreationOperatorFunctionFactory> = new Map([
	[ElementType.Merge, createMergeOperator],
	[ElementType.CombineLatest, createCombineLatestOperator],
	[ElementType.Concat, createConcatOperator],
	[ElementType.ForkJoin, createForkJoinOperator],
	[ElementType.Race, createRaceOperator],
	[ElementType.Zip, createZipOperator],
]);

export const joinCreationOperatorFactory: JoinCreationOperatorFactory = {
	create(el: Element, props: OperatorProps): CreationObservableFactory {
		const factory = supportedOperators.get(el.type);
		if (!factory) {
			throw new UnsupportedElementTypeError(el.id, el.type, ElementGroup.JoinCreation);
		}

		return factory(el, props);
	},
	isSupported(el: Element): boolean {
		return supportedOperators.has(el.type);
	},
};
