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
	ObservableGeneratorProps,
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
	BufferWhenElement,
	ConcatElement,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
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

	const [refObservableGenerator] = props.refObservableGenerators;
	let branchId: string | undefined;
	return o.pipe(
		tap((flowValue) => (branchId = flowValue.branchId)),
		buffer(refObservableGenerator.observableGenerator(undefined, branchId)),
		mapFlowValuesArray(el.id),
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
		const { properties } = el as BufferToggleElement;
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

		function closingSelector(value: FlowValue, closingRefObservable: ObservableGeneratorProps) {
			const wrappedObservableGenerator = wrapGeneratorCallback(
				closingRefObservable.observableGenerator,
				value.branchId,
			);
			const closingNotifierRefInvokerFn: (...args: unknown[]) => Observable<FlowValue> =
				new Function(OBSERVABLE_GENERATOR_NAME, `return ${properties.projectExpression}`)(
					wrappedObservableGenerator,
				);

			closingRefObservable.onSubscribe?.(value);
			return closingNotifierRefInvokerFn(value.raw);
		}

		let branchId: string | undefined;
		return o.pipe(
			tap((flowValue) => (branchId = flowValue.branchId)),
			bufferToggle(sourceRefObservable.observableGenerator(undefined, branchId), (value) =>
				closingSelector(value, closingRefObservable),
			),
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

		function closingSelector(branchId: string, closingRefObservable: ObservableGeneratorProps) {
			const wrappedObservableGenerator = wrapGeneratorCallback(
				closingRefObservable.observableGenerator,
				branchId,
			);
			const closingSelectorRefInvokerFn: (...args: unknown[]) => Observable<FlowValue> =
				new Function(OBSERVABLE_GENERATOR_NAME, `return ${properties.projectExpression}`)(
					wrappedObservableGenerator,
				);

			closingRefObservable.onSubscribe?.(FlowValue.createFlowValue(id, branchId));
			return closingSelectorRefInvokerFn();
		}

		const { id, type, properties } = el as BufferWhenElement;
		const [refObservable] = props.refObservableGenerators;
		let branchId: string | undefined;
		return o.pipe(
			tap((flowValue) => (branchId = flowValue.branchId)),
			bufferWhen(() => {
				if (!branchId) {
					throw new Error(`Missing instance id on element ${id} of type ${type}.`);
				}

				return closingSelector(branchId, refObservable);
			}),
			mapFlowValuesArray(el.id),
		);
	};

function projectCallback(
	value: FlowValue,
	index: number,
	properties: ElementProps,
	refObservable: ObservableGeneratorProps,
) {
	const wrappedObservableGenerator = wrapGeneratorCallback(
		refObservable.observableGenerator,
		value.branchId,
	);
	const projectRefInvokerFn: (...args: unknown[]) => Observable<FlowValue> = new Function(
		OBSERVABLE_GENERATOR_NAME,
		`return ${properties.projectExpression}`,
	)(wrappedObservableGenerator);

	refObservable.onSubscribe?.(value);
	return projectRefInvokerFn(value.raw, index);
}

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

		const { properties } = el as ConcatElement;
		const [refObservableGenerator] = props.refObservableGenerators;
		return o.pipe(
			concatMap<FlowValue, ObservableInput<FlowValue>>((value, index) =>
				projectCallback(value, index, properties, refObservableGenerator),
			),
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
			mergeMap<FlowValue, ObservableInput<FlowValue>>(
				(value, index) => projectCallback(value, index, properties, refObservableGenerator),
				properties.concurrent,
			),
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
		exhaustMap<FlowValue, ObservableInput<FlowValue>>((value, index) =>
			projectCallback(value, index, properties, refObservableGenerator),
		),
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
	return o.pipe(
		expand<FlowValue, ObservableInput<FlowValue>>(
			(value, index) => projectCallback(value, index, properties, refObservableGenerator),
			properties.concurrent,
		),
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

