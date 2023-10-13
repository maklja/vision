import { combineLatest, concat, defer, forkJoin, map, merge, Observable, race, zip } from 'rxjs';
import { Element, ElementGroup, ElementType, MergeElement } from '../../model';
import { JoinCreationOperatorFactory, OperatorOptions } from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import { UnsupportedElementTypeError } from '../errors';

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
		return combineLatest<FlowValue[]>(
			options.referenceObservables.map((refObservable) =>
				defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(el.id));
					return refObservable.observable;
				}),
			),
		).pipe(this.mapFlowValuesArray(el.id));
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
		return forkJoin<FlowValue[]>(
			options.referenceObservables.map((refObservable) =>
				defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(el.id));
					return refObservable.observable;
				}),
			),
		).pipe(this.mapFlowValuesArray(el.id));
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
		).pipe(this.mapFlowValuesArray(el.id));
	}

	private mapFlowValuesArray(elementId: string) {
		return map(
			(flowValues: FlowValue[]) =>
				new FlowValue(
					flowValues.map((flowValue) => flowValue.raw),
					elementId,
					FlowValueType.Next,
				),
		);
	}
}

