import { filter } from 'rxjs';
import {
	PipeOperatorFactory,
	PipeOperatorFactoryParams,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { Element, ElementType, FilterElement } from '../../model';
import { mapOutputToFlowValue } from './utils';

export class DefaultFilteringOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Filter, this.createFilterOperator.bind(this)],
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

	private createFilterOperator({ element, observable }: PipeOperatorFactoryParams) {
		const filterEl = element as FilterElement;
		const filterFn = new Function(`return ${filterEl.properties.expression}`);

		return observable.pipe(mapOutputToFlowValue(filter(filterFn())));
	}
}

