import { v1 } from 'uuid';
import {
	Observable,
	ObservableInput,
	buffer,
	bufferCount,
	bufferTime,
	bufferToggle,
	bufferWhen,
	concatMap,
	exhaustMap,
	expand,
	map,
	mergeMap,
	tap,
} from 'rxjs';
import {
	OperatorProps,
	PipeObservableFactory,
	PipeOperatorFactory,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue } from '../context';
import {
	BufferCountElement,
	BufferTimeElement,
	BufferToggleElement,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementType,
	ExhaustMapElement,
	ExpandElement,
	MapElement,
	MergeMapElement,
	OBSERVABLE_GENERATOR_NAME,
} from '@maklja/vision-simulator-model';
import { MissingReferenceObservableError } from '../errors';
import { mapFlowValuesArray, mapOutputToFlowValue, wrapGeneratorCallback } from './utils';

const createBufferOperator = (el: Element, props: OperatorProps) => (o: Observable<FlowValue>) => {
	if (props.refObservableGenerators.length === 0) {
		throw new MissingReferenceObservableError(
			el.id,
			'Reference observable is required for buffer operator',
		);
	}

	if (props.refObservableGenerators.length > 1) {
		throw new Error('Too many reference observables for buffer operator');
	}

	const subscribeId = v1();
	const [refObservableGenerator] = props.refObservableGenerators;
	const wrappedObservableGenerator = wrapGeneratorCallback(
		refObservableGenerator.observableGenerator,
		subscribeId,
	);

	refObservableGenerator.onSubscribe?.(
		FlowValue.createSubscribeEvent({
			elementId: el.id,
			id: subscribeId,
		}),
	);
	const bufferCache: string[] = [];
	return o.pipe(
		buffer(
			wrappedObservableGenerator().pipe(tap((flowValue) => bufferCache.push(flowValue.id))),
		),
		map((flowValues: FlowValue[]) => {
			const flowValueId = bufferCache.shift();
			const dependencies = flowValues.map((flowValue) => flowValue.id);
			return FlowValue.createNextEvent({
				value: flowValues.map((flowValue) => flowValue.raw),
				elementId: el.id,
				dependencies: flowValueId ? [...dependencies, flowValueId] : dependencies,
			});
		}),
	);
};

const createBufferCountOperator = (el: Element) => (o: Observable<FlowValue>) => {
	const { properties } = el as BufferCountElement;
	return o.pipe(
		bufferCount(properties.bufferSize, properties.startBufferEvery),
		mapFlowValuesArray(el.id),
	);
};

const createBufferTimeOperator = (el: Element) => (o: Observable<FlowValue>) => {
	const { properties } = el as BufferTimeElement;

	if (properties.maxBufferSize) {
		return o.pipe(
			bufferTime(
				properties.bufferTimeSpan,
				properties.bufferCreationInterval,
				properties.maxBufferSize,
			),
			mapFlowValuesArray(el.id),
		);
	}

	return o.pipe(
		bufferTime(properties.bufferTimeSpan, properties.bufferCreationInterval),
		mapFlowValuesArray(el.id),
	);
};

const createBufferToggleOperator =
	(el: Element, props: OperatorProps) => (o: Observable<FlowValue>) => {
		const sourceRefObservable = props.refObservableGenerators.find(
			({ connectPoint }) =>
				connectPoint.connectPointType === ConnectPointType.Event &&
				connectPoint.connectPosition === ConnectPointPosition.Top,
		);
		if (!sourceRefObservable) {
			throw new MissingReferenceObservableError(
				el.id,
				'Not found source branch observable operator',
			);
		}

		const closingRefObservable = props.refObservableGenerators.find(
			({ connectPoint }) =>
				connectPoint.connectPointType === ConnectPointType.Event &&
				connectPoint.connectPosition === ConnectPointPosition.Bottom,
		);
		if (!closingRefObservable) {
			throw new MissingReferenceObservableError(
				el.id,
				'Not found closing branch observable operator',
			);
		}

		const { properties } = el as BufferToggleElement;
		const closingNotifierRefInvokerFn: (...args: unknown[]) => Observable<FlowValue> =
			new Function(OBSERVABLE_GENERATOR_NAME, `return ${properties.projectExpression}`)(
				closingRefObservable.observableGenerator,
			);
		return o.pipe(
			bufferToggle(sourceRefObservable.observableGenerator(), (value) => {
				closingRefObservable.onSubscribe?.(value);
				return closingNotifierRefInvokerFn(value.raw);
			}),
			mapFlowValuesArray(el.id),
		);
	};

const createBufferWhenOperator =
	(el: Element, props: OperatorProps) => (o: Observable<FlowValue>) => {
		if (props.refObservableGenerators.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for bufferWhen operator',
			);
		}

		if (props.refObservableGenerators.length > 1) {
			throw new Error('Too many reference observables for bufferWhen operator');
		}

		return o.pipe(
			bufferWhen(() => {
				const subscribeId = v1();
				const [refObservableGenerator] = props.refObservableGenerators;
				const wrappedObservableGenerator = wrapGeneratorCallback(
					refObservableGenerator.observableGenerator,
					subscribeId,
				);
				const closingSelectorRefInvokerFn: (...args: unknown[]) => Observable<FlowValue> =
					new Function(
						OBSERVABLE_GENERATOR_NAME,
						`return ${el.properties.closingSelectorExpression}`,
					)(wrappedObservableGenerator);

				refObservableGenerator.onSubscribe?.(
					FlowValue.createSubscribeEvent({
						elementId: el.id,
						id: subscribeId,
					}),
				);
				return closingSelectorRefInvokerFn();
			}),
			mapFlowValuesArray(el.id),
		);
	};

const createConcatMapOperator =
	(el: Element, props: OperatorProps) => (o: Observable<FlowValue>) => {
		if (props.refObservableGenerators.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for concatMap operator',
			);
		}

		if (props.refObservableGenerators.length > 1) {
			throw new Error('Too many reference observables for concatMap operator');
		}

		const [refObservableGenerator] = props.refObservableGenerators;
		return o.pipe(
			concatMap<FlowValue, ObservableInput<FlowValue>>((value, index) => {
				const subscribeId = v1();
				const wrappedObservableGenerator = wrapGeneratorCallback(
					refObservableGenerator.observableGenerator,
					subscribeId,
				);
				const projectRefInvokerFn: (...args: unknown[]) => Observable<FlowValue> =
					new Function(
						OBSERVABLE_GENERATOR_NAME,
						`return ${el.properties.projectExpression}`,
					)(wrappedObservableGenerator);

				refObservableGenerator.onSubscribe?.(
					FlowValue.createSubscribeEvent({
						elementId: el.id,
						id: subscribeId,
						dependencies: [value.id],
					}),
				);
				return projectRefInvokerFn(value.raw, index);
			}),
		);
	};

const createMapOperator = (el: Element) => (o: Observable<FlowValue>) => {
	const mapEl = el as MapElement;
	const mapFn = new Function(`return ${mapEl.properties.projectExpression}`);

	return o.pipe(mapOutputToFlowValue(map(mapFn())));
};

const createMergeMapOperator =
	(el: Element, props: OperatorProps) => (o: Observable<FlowValue>) => {
		if (props.refObservableGenerators.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for mergeMap operator',
			);
		}

		if (props.refObservableGenerators.length > 1) {
			throw new Error('Too many reference observables for mergeMap operator');
		}

		const [refObservableGenerator] = props.refObservableGenerators;
		const { properties } = el as MergeMapElement;
		return o.pipe(
			mergeMap<FlowValue, ObservableInput<FlowValue>>((value, index) => {
				const subscribeId = v1();
				const wrappedObservableGenerator = wrapGeneratorCallback(
					refObservableGenerator.observableGenerator,
					subscribeId,
				);
				const projectRefInvokerFn: (...args: unknown[]) => Observable<FlowValue> =
					new Function(
						OBSERVABLE_GENERATOR_NAME,
						`return ${properties.projectExpression}`,
					)(wrappedObservableGenerator);

				refObservableGenerator.onSubscribe?.(
					FlowValue.createSubscribeEvent({
						elementId: el.id,
						id: subscribeId,
						dependencies: [value.id],
					}),
				);
				return projectRefInvokerFn(value.raw, index);
			}, properties.concurrent),
		);
	};

const createExhaustOperator = (el: Element, props: OperatorProps) => (o: Observable<FlowValue>) => {
	if (props.refObservableGenerators.length === 0) {
		throw new MissingReferenceObservableError(
			el.id,
			'Reference observable is required for exhaust operator',
		);
	}

	if (props.refObservableGenerators.length > 1) {
		throw new Error('Too many reference observables for exhaust operator');
	}

	const { properties } = el as ExhaustMapElement;
	const [refObservableGenerator] = props.refObservableGenerators;
	return o.pipe(
		exhaustMap<FlowValue, ObservableInput<FlowValue>>((value, index) => {
			const subscribeId = v1();
			const wrappedObservableGenerator = wrapGeneratorCallback(
				refObservableGenerator.observableGenerator,
				subscribeId,
			);
			const projectRefInvokerFn: (...args: unknown[]) => Observable<FlowValue> = new Function(
				OBSERVABLE_GENERATOR_NAME,
				`return ${properties.projectExpression}`,
			)(wrappedObservableGenerator);

			refObservableGenerator.onSubscribe?.(
				FlowValue.createSubscribeEvent({
					elementId: el.id,
					id: subscribeId,
					dependencies: [value.id],
				}),
			);
			return projectRefInvokerFn(value.raw, index);
		}),
	);
};

const createExpandOperator = (el: Element, props: OperatorProps) => (o: Observable<FlowValue>) => {
	if (props.refObservableGenerators.length === 0) {
		throw new MissingReferenceObservableError(
			el.id,
			'Reference observable is required for expand operator',
		);
	}

	if (props.refObservableGenerators.length > 1) {
		throw new Error('Too many reference observables for expand operator');
	}

	const { properties } = el as ExpandElement;
	const [refObservableGenerator] = props.refObservableGenerators;
	const projectRefInvokerFn: (...args: unknown[]) => Observable<FlowValue> = new Function(
		OBSERVABLE_GENERATOR_NAME,
		`return ${properties.projectExpression}`,
	)(refObservableGenerator.observableGenerator);
	return o.pipe(
		expand<FlowValue, ObservableInput<FlowValue>>((value, index) => {
			refObservableGenerator.onSubscribe?.(value);
			return projectRefInvokerFn(value.raw, index);
		}, properties.concurrent),
	);
};

const supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory> = new Map([
	[ElementType.Buffer, createBufferOperator],
	[ElementType.BufferCount, createBufferCountOperator],
	[ElementType.BufferTime, createBufferTimeOperator],
	[ElementType.BufferToggle, createBufferToggleOperator],
	[ElementType.BufferWhen, createBufferWhenOperator],
	[ElementType.ConcatMap, createConcatMapOperator],
	[ElementType.Map, createMapOperator],
	[ElementType.MergeMap, createMergeMapOperator],
	[ElementType.ExhaustMap, createExhaustOperator],
	[ElementType.Expand, createExpandOperator],
]);

export const transformationOperatorFactory: PipeOperatorFactory = {
	create(el: Element, props: OperatorProps): PipeObservableFactory {
		const factory = supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory(el, props);
	},
	isSupported(el: Element): boolean {
		return supportedOperators.has(el.type);
	},
};
