import { ObservableInput, catchError } from 'rxjs';
import {
	PipeOperatorFactory,
	PipeOperatorFactoryParams,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import { Element, ElementType } from '../../model';
import { MissingReferenceObservableError } from '../errors';

export class DefaultErrorHandlingOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.CatchError, this.createCatchErrorOperator.bind(this)],
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

	private createCatchErrorOperator({ element, observable, options }: PipeOperatorFactoryParams) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				element.id,
				'Reference observable is required for catchError operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for catchError operator');
		}

		const [refObservable] = options.referenceObservables;
		return observable.pipe(
			catchError<FlowValue, ObservableInput<FlowValue>>((error) => {
				refObservable.invokeTrigger?.({
					...error,
					type: FlowValueType.Next,
				});
				return refObservable.observable;
			}),
		);
	}
}

