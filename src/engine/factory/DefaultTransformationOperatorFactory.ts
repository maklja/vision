import {
	ObservableInput,
	buffer,
	bufferCount,
	bufferTime,
	bufferWhen,
	concatMap,
	map,
	mergeMap,
} from 'rxjs';
import {
	CONTEXT_VARIABLE_NAME,
	PipeOperatorFactory,
	PipeOperatorFactoryParams,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue } from '../context';
import {
	BufferCountElement,
	BufferTimeElement,
	ConcatMapElement,
	Element,
	ElementType,
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
			[ElementType.BufferWhen, this.createBufferWhenOperator.bind(this)],
			[ElementType.Map, this.createMapOperator.bind(this)],
			[ElementType.ConcatMap, this.createConcatMapOperator.bind(this)],
			[ElementType.MergeMap, this.createMergeMapOperator.bind(this)],
		]);
	}

	create(params: PipeOperatorFactoryParams) {
		const factory = this.supportedOperators.get(params.element.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${params.element.type} as pipe operator.`);
		}

		return factory(params);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createBufferOperator({ observable, element, options }: PipeOperatorFactoryParams) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				element.id,
				'Reference observable is required for buffer operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for buffer operator');
		}

		const [refObservable] = options.referenceObservables;
		return observable.pipe(buffer(refObservable.observable), mapFlowValuesArray(element.id));
	}

	private createBufferCountOperator({ observable, element }: PipeOperatorFactoryParams) {
		const { properties } = element as BufferCountElement;
		return observable.pipe(
			bufferCount(properties.bufferSize, properties.startBufferEvery),
			mapFlowValuesArray(element.id),
		);
	}

	private createBufferTimeOperator({ element, observable }: PipeOperatorFactoryParams) {
		const { properties } = element as BufferTimeElement;

		if (properties.maxBufferSize) {
			return observable.pipe(
				bufferTime(
					properties.bufferTimeSpan,
					properties.bufferCreationInterval,
					properties.maxBufferSize,
				),
				mapFlowValuesArray(element.id),
			);
		}

		return observable.pipe(
			bufferTime(properties.bufferTimeSpan, properties.bufferCreationInterval),
			mapFlowValuesArray(element.id),
		);
	}

	private createBufferWhenOperator({ observable, element, options }: PipeOperatorFactoryParams) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				element.id,
				'Reference observable is required for bufferWhen operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for bufferWhen operator');
		}

		const [refObservable] = options.referenceObservables;
		// TODO pre code execution
		return observable.pipe(
			bufferWhen(() => refObservable.observable),
			mapFlowValuesArray(element.id),
		);
	}

	private createMapOperator({ element, observable }: PipeOperatorFactoryParams) {
		const mapEl = element as MapElement;
		const mapFn = new Function(`return ${mapEl.properties.expression}`);

		return observable.pipe(mapOutputToFlowValue(map(mapFn())));
	}

	private createConcatMapOperator({
		element,
		observable,
		context,
		options,
	}: PipeOperatorFactoryParams) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				element.id,
				'Reference observable is required for concatMap operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for concatMap operator');
		}

		const { properties } = element as ConcatMapElement;
		const [refObservable] = options.referenceObservables;
		return observable.pipe(
			concatMap<FlowValue, ObservableInput<FlowValue>>((value) => {
				if (properties.preInputObservableCreation) {
					const hook = new Function(
						CONTEXT_VARIABLE_NAME,
						`return ${properties.preInputObservableCreation}`,
					);
					hook(context)(value.raw);
				}

				refObservable.invokeTrigger?.(value);
				return refObservable.observable;
			}),
		);
	}

	private createMergeMapOperator({ element, observable, options }: PipeOperatorFactoryParams) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				element.id,
				'Reference observable is required for mergeMap operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for mergeMap operator');
		}

		const [refObservable] = options.referenceObservables;
		return observable.pipe(
			mergeMap<FlowValue, ObservableInput<FlowValue>>((value) => {
				refObservable.invokeTrigger?.(value);
				return refObservable.observable;
			}),
		);
	}
}

