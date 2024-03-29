import { Observable, filter } from 'rxjs';
import { OperatorProps, PipeOperatorFactory, PipeOperatorFunctionFactory } from './OperatorFactory';
import { FlowValue } from '../context';
import { Element, ElementType, FilterElement } from '../../model';
import { mapOutputToFlowValue } from './utils';

export class DefaultFilteringOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Filter, this.createFilterOperator.bind(this)],
		]);
	}

	create(el: Element, props?: OperatorProps) {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory(el, props);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createFilterOperator(el: Element) {
		return (o: Observable<FlowValue>) => {
			const filterEl = el as FilterElement;
			const filterFn = new Function(`return ${filterEl.properties.expression}`);

			return o.pipe(mapOutputToFlowValue(filter(filterFn())));
		};
	}
}

