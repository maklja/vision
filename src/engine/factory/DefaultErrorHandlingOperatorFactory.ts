import { Observable, ObservableInput, catchError } from 'rxjs';
import {
	OperatorOptions,
	OperatorProps,
	PipeObservableFactory,
	PipeOperatorFactory,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import { Element, ElementType } from '../../model';
import { MissingReferenceObservableError } from '../errors';

export class DefaultErrorHandlingOperatorFactory implements PipeOperatorFactory {
	create(
		el: Element<Record<string, unknown>>,
		props?: OperatorProps | undefined,
	): PipeObservableFactory {
		throw new Error('Method not implemented.');
	}
	isSupported(el: Element<Record<string, unknown>>): boolean {
		throw new Error('Method not implemented.');
	}
	// private readonly supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory>;

	// constructor() {
	// 	this.supportedOperators = new Map([
	// 		[ElementType.CatchError, this.createCatchErrorOperator.bind(this)],
	// 	]);
	// }

	// create(
	// 	o: Observable<FlowValue>,
	// 	el: Element,
	// 	options: OperatorOptions = { referenceObservables: [] },
	// ) {
	// 	const factory = this.supportedOperators.get(el.type);
	// 	if (!factory) {
	// 		throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
	// 	}

	// 	return factory(o, el, options);
	// }

	// isSupported(el: Element): boolean {
	// 	return this.supportedOperators.has(el.type);
	// }

	// private createCatchErrorOperator(
	// 	o: Observable<FlowValue>,
	// 	el: Element,
	// 	options: OperatorOptions,
	// ) {
	// 	if (options.referenceObservables.length === 0) {
	// 		throw new MissingReferenceObservableError(
	// 			el.id,
	// 			'Reference observable is required for catchError operator',
	// 		);
	// 	}

	// 	if (options.referenceObservables.length > 1) {
	// 		throw new Error('Too many reference observables for catchError operator');
	// 	}

	// 	const [refObservable] = options.referenceObservables;
	// 	return o.pipe(
	// 		catchError<FlowValue, ObservableInput<FlowValue>>((error) => {
	// 			refObservable.invokeTrigger?.({
	// 				...error,
	// 				type: FlowValueType.Next,
	// 			});
	// 			return refObservable.observable;
	// 		}),
	// 	);
	// }
}

