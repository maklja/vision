import { v1 } from 'uuid';
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
import { mapFlowValuesArray, wrapGeneratorCallback } from './utils';

type JoinCreationOperatorFunctionFactory = (
	el: Element,
	props: OperatorProps,
) => CreationObservableFactory;

function createIndexedObservableInput(
	id: string,
	observableGeneratorProps: readonly ObservableGeneratorProps[],
	overrideProperties?: ElementProps,
	parentSubscribeId?: string,
) {
	return observableGeneratorProps.map((observableGeneratorProp) =>
		defer(() => {
			const subscribeId = v1();
			observableGeneratorProp.onSubscribe?.(
				FlowValue.createSubscribeEvent({
					elementId: id,
					id: subscribeId,
					subscribeId: parentSubscribeId,
				}),
			);

			const wrappedObservableGenerator = wrapGeneratorCallback(
				observableGeneratorProp.observableGenerator,
				subscribeId,
			);
			return wrappedObservableGenerator(overrideProperties);
		}),
	);
}

function createNamedObservableInput(
	id: string,
	observableGeneratorProps: readonly ObservableGeneratorProps[],
	overrideProperties?: ElementProps,
	parentSubscribeId?: string,
): Record<string, ObservableInput<FlowValue>> {
	return observableGeneratorProps.reduce(
		(namedObservableInput, observableGeneratorProp) => ({
			...namedObservableInput,
			[observableGeneratorProp.connectLine.name]: defer(() => {
				const subscribeId = v1();
				observableGeneratorProp.onSubscribe?.(
					FlowValue.createSubscribeEvent({
						elementId: id,
						id: subscribeId,
						subscribeId: parentSubscribeId,
					}),
				);

				const wrappedObservableGenerator = wrapGeneratorCallback(
					observableGeneratorProp.observableGenerator,
					subscribeId,
				);
				return wrappedObservableGenerator(overrideProperties);
			}),
		}),
		{},
	);
}

function mapNamedObservableOutput(value: Record<string, FlowValue>, elId: string) {
	const valueObj = Object.entries(value).reduce(
		(value, [key, flowValue]) => ({
			...value,
			[key]: flowValue.raw,
		}),
		{},
	);
	const dependencies = Object.values(value).map((flowValue: FlowValue) => flowValue.id);

	return FlowValue.createNextEvent({
		value: valueObj,
		elementId: elId,
		dependencies,
	});
}

const createMergeOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, parentSubscribeId?: string) => {
		const mergeEl = el as MergeElement;
		const mergeElProperties: MergeElementProperties = {
			...mergeEl.properties,
			...overrideProperties,
		};

		return merge<FlowValue[]>(
			...props.refObservableGenerators.map(
				(refObservableGenerator) =>
					defer(() => {
						const subscribeId = v1();
						refObservableGenerator.onSubscribe?.(
							FlowValue.createSubscribeEvent({
								elementId: mergeEl.id,
								id: subscribeId,
								subscribeId: parentSubscribeId,
							}),
						);
						const wrappedObservableGenerator = wrapGeneratorCallback(
							refObservableGenerator.observableGenerator,
							subscribeId,
						);
						return wrappedObservableGenerator();
					}),
				mergeElProperties.limitConcurrent > 0
					? mergeElProperties.limitConcurrent
					: undefined,
			),
		);
	};

const createCombineLatestOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, parentSubscribeId?: string) => {
		const combineLatestEl = el as CombineLatestElement;

		if (combineLatestEl.properties.observableInputsType === ObservableInputsType.Array) {
			return combineLatest<FlowValue[]>(
				createIndexedObservableInput(
					combineLatestEl.id,
					props.refObservableGenerators,
					overrideProperties,
					parentSubscribeId,
				),
			).pipe(mapFlowValuesArray(combineLatestEl.id));
		}

		return combineLatest<Record<string, ObservableInput<FlowValue>>>(
			createNamedObservableInput(
				combineLatestEl.id,
				props.refObservableGenerators,
				overrideProperties,
				parentSubscribeId,
			),
		).pipe(map((value) => mapNamedObservableOutput(value, combineLatestEl.id)));
	};

const createConcatOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, parentSubscribeId?: string) => {
		return concat<FlowValue[]>(
			...props.refObservableGenerators.map((refObservableGenerator) =>
				defer(() => {
					const subscribeId = v1();
					refObservableGenerator.onSubscribe?.(
						FlowValue.createSubscribeEvent({
							elementId: el.id,
							id: subscribeId,
							subscribeId: parentSubscribeId,
						}),
					);

					const wrappedObservableGenerator = wrapGeneratorCallback(
						refObservableGenerator.observableGenerator,
						subscribeId,
					);
					return wrappedObservableGenerator(overrideProperties);
				}),
			),
		);
	};

const createForkJoinOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, parentSubscribeId?: string) => {
		const forkJoinEl = el as ForkJoinElement;

		if (forkJoinEl.properties.observableInputsType === ObservableInputsType.Array) {
			return forkJoin<FlowValue[]>(
				createIndexedObservableInput(
					forkJoinEl.id,
					props.refObservableGenerators,
					overrideProperties,
					parentSubscribeId,
				),
			).pipe(mapFlowValuesArray(forkJoinEl.id));
		}

		return forkJoin<Record<string, ObservableInput<FlowValue>>>(
			createNamedObservableInput(
				forkJoinEl.id,
				props.refObservableGenerators,
				overrideProperties,
				parentSubscribeId,
			),
		).pipe(map((value) => mapNamedObservableOutput(value, forkJoinEl.id)));
	};

const createRaceOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, parentSubscribeId?: string) => {
		return race<FlowValue[]>(
			props.refObservableGenerators.map((refObservableGenerator) =>
				defer(() => {
					const subscribeId = v1();
					refObservableGenerator.onSubscribe?.(
						FlowValue.createSubscribeEvent({
							elementId: el.id,
							id: subscribeId,
							subscribeId: parentSubscribeId,
						}),
					);
					const wrappedObservableGenerator = wrapGeneratorCallback(
						refObservableGenerator.observableGenerator,
						subscribeId,
					);

					return wrappedObservableGenerator(overrideProperties);
				}),
			),
		);
	};

const createZipOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, parentSubscribeId?: string) => {
		return zip<FlowValue[]>(
			props.refObservableGenerators.map((refObservableGenerator) =>
				defer(() => {
					const subscribeId = v1();
					refObservableGenerator.onSubscribe?.(
						FlowValue.createSubscribeEvent({
							elementId: el.id,
							id: subscribeId,
							subscribeId: parentSubscribeId,
						}),
					);
					const wrappedObservableGenerator = wrapGeneratorCallback(
						refObservableGenerator.observableGenerator,
						subscribeId,
					);
					return wrappedObservableGenerator(overrideProperties);
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

