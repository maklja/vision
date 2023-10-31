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
import {
	CreationOperatorFunctionFactory,
	JoinCreationOperatorFactory,
	ObservableOptions,
	OperatorFactoryParams,
} from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import { UnsupportedElementTypeError } from '../errors';
import { mapFlowValuesArray } from './utils';

export class DefaultJoinCreationOperatorFactory implements JoinCreationOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, CreationOperatorFunctionFactory>;

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

	create(params: OperatorFactoryParams): Observable<FlowValue> {
		const factory = this.supportedOperators.get(params.element.type);
		if (!factory) {
			throw new UnsupportedElementTypeError(
				params.element.id,
				params.element.type,
				ElementGroup.JoinCreation,
			);
		}

		return factory(params);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createMergeOperator({ element, options }: OperatorFactoryParams) {
		const { properties } = element as MergeElement;

		return merge<FlowValue[]>(
			...options.referenceObservables.map(
				(refObservable) =>
					defer(() => {
						refObservable.invokeTrigger?.(FlowValue.createEmptyValue(element.id));
						return refObservable.observable;
					}),
				properties.limitConcurrent > 0 ? properties.limitConcurrent : undefined,
			),
		);
	}

	private createCombineLatestOperator({ element, options }: OperatorFactoryParams) {
		const combineLatestEl = element as CombineLatestElement;

		if (combineLatestEl.properties.observableInputsType === ObservableInputsType.Array) {
			return combineLatest<FlowValue[]>(
				this.createIndexedObservableInput(combineLatestEl.id, options.referenceObservables),
			).pipe(mapFlowValuesArray(combineLatestEl.id));
		}

		return combineLatest<Record<string, ObservableInput<unknown>>>(
			this.createNamedObservableInput(combineLatestEl.id, options.referenceObservables),
		).pipe(map((value) => this.createFlowValue(value, combineLatestEl.id)));
	}

	private createConcatOperator({ element, options }: OperatorFactoryParams) {
		return concat<FlowValue[]>(
			...options.referenceObservables.map((refObservable) =>
				defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(element.id));
					return refObservable.observable;
				}),
			),
		);
	}

	private createForkJoinOperator({ element, options }: OperatorFactoryParams) {
		const forkJoinEl = element as ForkJoinElement;

		if (forkJoinEl.properties.observableInputsType === ObservableInputsType.Array) {
			return forkJoin<FlowValue[]>(
				this.createIndexedObservableInput(forkJoinEl.id, options.referenceObservables),
			).pipe(mapFlowValuesArray(forkJoinEl.id));
		}

		return forkJoin<Record<string, ObservableInput<unknown>>>(
			this.createNamedObservableInput(forkJoinEl.id, options.referenceObservables),
		).pipe(map((value) => this.createFlowValue(value, forkJoinEl.id)));
	}

	private createRaceOperator({ element, options }: OperatorFactoryParams) {
		return race<FlowValue[]>(
			options.referenceObservables.map((refObservable) =>
				defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(element.id));
					return refObservable.observable;
				}),
			),
		);
	}

	private createZipOperator({ element, options }: OperatorFactoryParams) {
		return zip<FlowValue[]>(
			options.referenceObservables.map((refObservable) =>
				defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(element.id));
					return refObservable.observable;
				}),
			),
		).pipe(mapFlowValuesArray(element.id));
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

