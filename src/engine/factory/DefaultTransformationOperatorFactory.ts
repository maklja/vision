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
} from 'rxjs';
import {
	OperatorOptions,
	PipeOperatorFactory,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue } from '../context';
import {
	BufferCountElement,
	BufferTimeElement,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementType,
	ExpandElement,
	MapElement,
} from '../../model';
import { MissingReferenceObservableError } from '../errors';
import { mapFlowValuesArray, mapOutputToFlowValue } from './utils';

export class DefaultTransformationOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Buffer, this.createBufferOperator.bind(this)],
			[ElementType.BufferCount, this.createBufferCountOperator.bind(this)],
			[ElementType.BufferTime, this.createBufferTimeOperator.bind(this)],
			[ElementType.BufferToggle, this.createBufferToggleOperator.bind(this)],
			[ElementType.BufferWhen, this.createBufferWhenOperator.bind(this)],
			[ElementType.ExhaustMap, this.createExhaustOperator.bind(this)],
			[ElementType.Expand, this.createExpandOperator.bind(this)],
			[ElementType.Map, this.createMapOperator.bind(this)],
			[ElementType.ConcatMap, this.createConcatMapOperator.bind(this)],
			[ElementType.MergeMap, this.createMergeMapOperator.bind(this)],
		]);
	}

	create(
		o: Observable<FlowValue>,
		el: Element,
		options: OperatorOptions = { referenceObservables: [] },
	) {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory(o, el, options);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createBufferOperator(o: Observable<FlowValue>, el: Element, options: OperatorOptions) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for buffer operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for buffer operator');
		}

		const [refObservable] = options.referenceObservables;
		return o.pipe(buffer(refObservable.observable), mapFlowValuesArray(el.id));
	}

	private createBufferCountOperator(o: Observable<FlowValue>, el: Element) {
		const { properties } = el as BufferCountElement;
		return o.pipe(
			bufferCount(properties.bufferSize, properties.startBufferEvery),
			mapFlowValuesArray(el.id),
		);
	}

	private createBufferTimeOperator(o: Observable<FlowValue>, el: Element) {
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
	}

	private createBufferToggleOperator(
		o: Observable<FlowValue>,
		el: Element,
		options: OperatorOptions,
	) {
		const sourceRefObservable = options.referenceObservables.find(
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

		const closingRefObservable = options.referenceObservables.find(
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

		// TODO second parameter should be configurable in the code
		return o.pipe(
			bufferToggle(sourceRefObservable.observable, () => closingRefObservable.observable),
			mapFlowValuesArray(el.id),
		);
	}

	private createBufferWhenOperator(
		o: Observable<FlowValue>,
		el: Element,
		options: OperatorOptions,
	) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for bufferWhen operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for bufferWhen operator');
		}

		const [refObservable] = options.referenceObservables;
		// TODO pre code execution
		return o.pipe(
			bufferWhen(() => refObservable.observable),
			mapFlowValuesArray(el.id),
		);
	}

	private createMapOperator(o: Observable<FlowValue>, el: Element) {
		const mapEl = el as MapElement;
		const mapFn = new Function(`return ${mapEl.properties.expression}`);

		return o.pipe(mapOutputToFlowValue(map(mapFn())));
	}

	private createConcatMapOperator(
		o: Observable<FlowValue>,
		el: Element,
		options: OperatorOptions,
	) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for concatMap operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for concatMap operator');
		}

		const [refObservable] = options.referenceObservables;
		return o.pipe(
			concatMap<FlowValue, ObservableInput<FlowValue>>((value) => {
				refObservable.invokeTrigger?.(value);
				return refObservable.observable;
			}),
		);
	}

	private createMergeMapOperator(
		o: Observable<FlowValue>,
		el: Element,
		options: OperatorOptions,
	) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for mergeMap operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for mergeMap operator');
		}

		const [refObservable] = options.referenceObservables;
		return o.pipe(
			mergeMap<FlowValue, ObservableInput<FlowValue>>((value) => {
				refObservable.invokeTrigger?.(value);
				return refObservable.observable;
			}),
		);
	}

	private createExhaustOperator(o: Observable<FlowValue>, el: Element, options: OperatorOptions) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for exhaust operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for exhaust operator');
		}

		const [refObservable] = options.referenceObservables;
		return o.pipe(
			exhaustMap<FlowValue, ObservableInput<FlowValue>>((value) => {
				refObservable.invokeTrigger?.(value);
				return refObservable.observable;
			}),
		);
	}

	private createExpandOperator(o: Observable<FlowValue>, el: Element, options: OperatorOptions) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for expand operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for expand operator');
		}

		const { properties } = el as ExpandElement;
		const [refObservable] = options.referenceObservables;
		// TODO first parameter should be configurable in the code
		return o.pipe(
			expand<FlowValue, ObservableInput<FlowValue>>((value) => {
				refObservable.invokeTrigger?.(value);
				return refObservable.observable;
			}, properties.concurrent),
		);
	}
}

