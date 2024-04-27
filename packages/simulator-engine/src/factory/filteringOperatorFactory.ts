import { Observable, filter } from 'rxjs';
import { Element, ElementType, FilterElement } from '@maklja/vision-simulator-model';
import {
	OperatorProps,
	PipeObservableFactory,
	PipeOperatorFactory,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue } from '../context';
import { mapOutputToFlowValue } from './utils';

const createFilterOperator = (el: Element) => (o: Observable<FlowValue>) => {
	const filterEl = el as FilterElement;
	const filterFn = new Function(`return ${filterEl.properties.predicateExpression}`);

	return o.pipe(mapOutputToFlowValue(filter(filterFn())));
};

const supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory> = new Map([
	[ElementType.Filter, createFilterOperator],
]);

export const filteringOperatorFactory: PipeOperatorFactory = {
	create(el: Element, props: OperatorProps): PipeObservableFactory {
		const factory = supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory(el, props);
	},
	isSupported(el: Element): boolean {
		return supportedOperators.has(el.type);
	},
};
