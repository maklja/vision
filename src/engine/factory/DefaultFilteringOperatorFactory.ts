import { Observable, filter } from 'rxjs';
import {
	OperatorOptions,
	PipeOperatorFactory,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
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

	create(
		o: Observable<FlowValue>,
		el: Element,
		options: OperatorOptions = { referenceObservables: [] },
	) {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory(o, el, options);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createFilterOperator(o: Observable<FlowValue>, el: Element) {
		const filterEl = el as FilterElement;
		const filterFn = new Function(`return ${filterEl.properties.expression}`);

		return o.pipe(mapOutputToFlowValue(filter(filterFn())));
	}
}
