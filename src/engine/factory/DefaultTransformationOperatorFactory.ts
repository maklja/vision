import { ObservableInput, OperatorFunction, buffer, concatMap, map, mergeMap, tap } from 'rxjs';
import {
	OperatorOptions,
	PipeOperatorFactory,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue } from '../context';
import { Element, ElementType, MapElement } from '../../model';
import { MissingReferenceObservableError } from '../errors';
import { mapArrayOutputToFlowValue, mapOutputToFlowValue } from './utils';

export class DefaultTransformationOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Buffer, this.createBufferOperator.bind(this)],
			[ElementType.Map, this.createMapOperator.bind(this)],
			[ElementType.ConcatMap, this.createConcatMapOperator.bind(this)],
			[ElementType.MergeMap, this.createMergeMapOperator.bind(this)],
		]);
	}

	create(
		el: Element,
		options: OperatorOptions = { referenceObservables: [] },
	): OperatorFunction<FlowValue, FlowValue> {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory(el, options);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createBufferOperator(
		el: Element,
		options: OperatorOptions,
	): OperatorFunction<FlowValue, FlowValue> {
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
		// return buffer(refObservable.observable);
		return null;
	}

	private createMapOperator(el: Element): OperatorFunction<FlowValue, FlowValue> {
		const mapEl = el as MapElement;
		const mapFn = new Function(`return ${mapEl.properties.expression}`);

		return mapOutputToFlowValue(map(mapFn()));
	}

	private createConcatMapOperator(
		el: Element,
		options: OperatorOptions,
	): OperatorFunction<FlowValue, FlowValue> {
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
		return concatMap<FlowValue, ObservableInput<FlowValue>>((value) => {
			refObservable.invokeTrigger?.(value);
			return refObservable.observable;
		});
	}

	private createMergeMapOperator(
		el: Element,
		options: OperatorOptions,
	): OperatorFunction<FlowValue, FlowValue> {
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
		return mergeMap<FlowValue, ObservableInput<FlowValue>>((value) => {
			refObservable.invokeTrigger?.(value);
			return refObservable.observable;
		});
	}
}

