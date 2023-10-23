import {
	combineLatest,
	concat,
	defer,
	forkJoin,
	map,
	merge,
	Observable,
	ObservableInput,
	race,
	zip,
} from 'rxjs';
import {
	CombineLatestElement,
	Element,
	ElementGroup,
	ElementType,
	ForkJoinElement,
	MergeElement,
	ObservableInputsType,
} from '../../model';
import { JoinCreationOperatorFactory, ObservableOptions, OperatorOptions } from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import { UnsupportedElementTypeError } from '../errors';
import { mapFlowValuesArray } from './utils';

type JoinCreationOperatorFunctionFactory = (
	el: Element,
	options: OperatorOptions,
) => Observable<FlowValue>;

export class DefaultJoinCreationOperatorFactory implements JoinCreationOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<
		ElementType,
		JoinCreationOperatorFunctionFactory
	>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Merge, this.createMergeOperator.bind(this)],
			[ElementType.CombineLatest, this.createCombineLatestOperator.bind(this)],
			[ElementType.Concat, this.createConcatOperator.bind(this)],
			[ElementType.ForkJoin, this.createForkJoinOperator.bind(this)],
			[ElementType.Race, this.createRaceOperator.bind(this)],
			[ElementType.Zip, this.createZipOperator.bind(this)],
		]);
	}

	create(
		el: Element,
		options: OperatorOptions = { referenceObservables: [] },
	): Observable<FlowValue> {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new UnsupportedElementTypeError(el.id, el.type, ElementGroup.JoinCreation);
		}

		return factory(el, options);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createMergeOperator(el: Element, options: OperatorOptions) {
		const { properties } = el as MergeElement;

		return merge<FlowValue[]>(
			...options.referenceObservables.map(
				(refObservable) =>
					defer(() => {
						refObservable.invokeTrigger?.(FlowValue.createEmptyValue(el.id));
						return refObservable.observable;
					}),
				properties.limitConcurrent > 0 ? properties.limitConcurrent : undefined,
			),
		);
	}

	private createCombineLatestOperator(el: Element, options: OperatorOptions) {
		const combineLatestEl = el as CombineLatestElement;

		if (combineLatestEl.properties.observableInputsType === ObservableInputsType.Array) {
			return combineLatest<FlowValue[]>(
				this.createIndexedObservableInput(combineLatestEl.id, options.referenceObservables),
			).pipe(mapFlowValuesArray(combineLatestEl.id));
		}

		return combineLatest<Record<string, ObservableInput<unknown>>>(
			this.createNamedObservableInput(combineLatestEl.id, options.referenceObservables),
		).pipe(map((value) => this.createFlowValue(value, combineLatestEl.id)));
	}

	private createConcatOperator(el: Element, options: OperatorOptions) {
		return concat<FlowValue[]>(
			...options.referenceObservables.map((refObservable) =>
				defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(el.id));
					return refObservable.observable;
				}),
			),
		);
	}

	private createForkJoinOperator(el: Element, options: OperatorOptions) {
		const forkJoinEl = el as ForkJoinElement;

		if (forkJoinEl.properties.observableInputsType === ObservableInputsType.Array) {
			return forkJoin<FlowValue[]>(
				this.createIndexedObservableInput(forkJoinEl.id, options.referenceObservables),
			).pipe(mapFlowValuesArray(forkJoinEl.id));
		}

		return forkJoin<Record<string, ObservableInput<unknown>>>(
			this.createNamedObservableInput(forkJoinEl.id, options.referenceObservables),
		).pipe(map((value) => this.createFlowValue(value, forkJoinEl.id)));
	}

	private createRaceOperator(el: Element, options: OperatorOptions) {
		return race<FlowValue[]>(
			options.referenceObservables.map((refObservable) =>
				defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(el.id));
					return refObservable.observable;
				}),
			),
		);
	}

	private createZipOperator(el: Element, options: OperatorOptions) {
		return zip<FlowValue[]>(
			options.referenceObservables.map((refObservable) =>
				defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(el.id));
					return refObservable.observable;
				}),
			),
		).pipe(mapFlowValuesArray(el.id));
	}

	private createIndexedObservableInput(
		id: string,
		observableOptions: readonly ObservableOptions[],
	) {
		return observableOptions.map((refObservable) =>
			defer(() => {
				refObservable.invokeTrigger?.(FlowValue.createEmptyValue(id));
				return refObservable.observable;
			}),
		);
	}

	private createNamedObservableInput(
		id: string,
		observableOptions: readonly ObservableOptions[],
	): Record<string, ObservableInput<unknown>> {
		return observableOptions.reduce(
			(namedObservableInput, refObservable) => ({
				...namedObservableInput,
				[refObservable.connectLine.name]: defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(id));
					return refObservable.observable;
				}),
			}),
			{},
		);
	}

	private createFlowValue(value: unknown, elementId: string): FlowValue {
		return new FlowValue(value, elementId, FlowValueType.Next);
	}
}

