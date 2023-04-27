import { catchError, filter, map, ObservableInput, of, OperatorFunction } from 'rxjs';
import { Element, ElementType, FilterElement } from '../../model';
import { PipeOperatorFactory } from './OperatorFactory';
import { FlowValue } from '../context';

type PipeOperatorFunctionFactory = (el: Element) => OperatorFunction<FlowValue, FlowValue>;

export class DefaultPipeOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.CatchError, this.createCatchErrorOperator],
			[ElementType.Filter, this.createFilterOperator],
		]);
	}

	create(el: Element): OperatorFunction<FlowValue, FlowValue> {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory(el);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createCatchErrorOperator(): OperatorFunction<FlowValue, FlowValue> {
		return catchError<FlowValue, ObservableInput<FlowValue>>(() =>
			of(1).pipe(
				map((value) => ({
					id: 'test',
					hash: 'test',
					value,
				})),
			),
		);
	}

	private createFilterOperator(el: Element): OperatorFunction<FlowValue, FlowValue> {
		const filterEl = el as FilterElement;
		const filterFn = new Function('value', 'index', filterEl.properties.expression);

		return filter((flowValue, index) => filterFn(flowValue.value, index));
	}
}

