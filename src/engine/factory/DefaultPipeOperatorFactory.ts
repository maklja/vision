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
import { FlowValue, FlowValueType } from '../context';
import { MissingReferenceObservableError } from '../errors';

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
		el: Element,
		options: OperatorOptions,
	): OperatorFunction<FlowValue, FlowValue> {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for catchError operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for catchError operator');
		}

		const [refObservable] = options.referenceObservables;
		return catchError<FlowValue, ObservableInput<FlowValue>>((error) => {
			refObservable.invokeTrigger?.({
				...error,
				type: FlowValueType.Next,
			});
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

	private wrapOperator(operatorFn: OperatorFunction<unknown, unknown>) {
		return concatMap((flowValue: FlowValue) =>
			of(flowValue.raw).pipe(
				operatorFn,
				map(
					(value) =>
						new FlowValue(value, flowValue.elementId, flowValue.type, flowValue.id),
				),
			),
		);
	}
}
