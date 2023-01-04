import { catchError, filter, ObservableInput, of, OperatorFunction } from 'rxjs';
import { Element, ElementType, FilterElement } from '../../model';
import { PipeOperatorFactory } from './OperatorFactory';

type PipeOperatorFunctionFactory<T> = (el: Element) => OperatorFunction<T, unknown>;

export class DefaultPipeOperatorFactory<T = unknown> implements PipeOperatorFactory<T> {
	private readonly supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory<T>>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.CatchError, this.createCatchErrorOperator],
			[ElementType.Filter, this.createFilterOperator],
		]);
	}

	create(el: Element): OperatorFunction<T, unknown> {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory(el);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createCatchErrorOperator(): OperatorFunction<T, unknown> {
		return catchError<T, ObservableInput<unknown>>(() => of(1));
	}

	private createFilterOperator(el: Element): OperatorFunction<T, unknown> {
		const filterEl = el as FilterElement;
		const filterFn = new Function(`return ${filterEl.properties.expression}`);

		return filter<T>(filterFn());
	}
}
