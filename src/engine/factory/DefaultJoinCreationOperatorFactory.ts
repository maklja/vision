import { defer, merge, Observable } from 'rxjs';
import { Element, ElementType } from '../../model';
import { JoinCreationOperatorFactory, OperatorOptions } from './OperatorFactory';
import { FlowValue } from '../context';

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
		]);
	}

	create(
		el: Element,
		options: OperatorOptions = { referenceObservables: [] },
	): Observable<FlowValue> {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as join creation operator.`);
		}

		return factory(el, options);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createMergeOperator(el: Element, options: OperatorOptions) {
		return merge<FlowValue[]>(
			...options.referenceObservables.map((refObservable) =>
				defer(() => {
					refObservable.invokeTrigger?.(FlowValue.createEmptyValue(el.id));
					return refObservable.observable;
				}),
			),
		);
	}
}
