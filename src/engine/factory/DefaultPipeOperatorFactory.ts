import {
	catchError,
	concatMap,
	filter,
	map,
	mergeMap,
	ObservableInput,
	of,
	OperatorFunction,
} from 'rxjs';
import { Element, ElementType, FilterElement, MapElement } from '../../model';
import { OperatorOptions, PipeOperatorFactory } from './OperatorFactory';
import { FlowValue } from '../context';

type PipeOperatorFunctionFactory = (
	el: Element,
	options: OperatorOptions,
) => OperatorFunction<FlowValue, FlowValue>;

export class DefaultPipeOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.CatchError, this.createCatchErrorOperator.bind(this)],
			[ElementType.Filter, this.createFilterOperator.bind(this)],
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

	private createCatchErrorOperator(
		_el: Element,
		options: OperatorOptions,
	): OperatorFunction<FlowValue, FlowValue> {
		if (options.referenceObservables.length === 0) {
			throw new Error('Reference observable is required for catchError operator');
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for catchError operator');
		}

		const [refObservable] = options.referenceObservables;
		return catchError<FlowValue, ObservableInput<FlowValue>>((error) => {
			refObservable.invokeTrigger?.(error);
			return refObservable.observable;
		});
	}

	private createFilterOperator(el: Element): OperatorFunction<FlowValue, FlowValue> {
		const filterEl = el as FilterElement;
		const filterFn = new Function(`return ${filterEl.properties.expression}`);

		return this.wrapOperator(filter(filterFn()));
	}

	private createMapOperator(el: Element): OperatorFunction<FlowValue, FlowValue> {
		const mapEl = el as MapElement;
		const mapFn = new Function(`return ${mapEl.properties.expression}`);

		return this.wrapOperator(map(mapFn()));
	}

	private createConcatMapOperator(
		_el: Element,
		options: OperatorOptions,
	): OperatorFunction<FlowValue, FlowValue> {
		if (options.referenceObservables.length === 0) {
			throw new Error('Reference observable is required for concatMap operator');
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
		_el: Element,
		options: OperatorOptions,
	): OperatorFunction<FlowValue, FlowValue> {
		if (options.referenceObservables.length === 0) {
			throw new Error('Reference observable is required for mergeMap operator');
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

	private wrapOperator(operatorFn: OperatorFunction<unknown, unknown>) {
		return concatMap((flowValue: FlowValue) =>
			of(flowValue.value).pipe(
				operatorFn,
				map((value) => new FlowValue(value, flowValue.id)),
			),
		);
	}
}
