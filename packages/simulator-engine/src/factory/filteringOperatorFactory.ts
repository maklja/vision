import { compileCallback, validateReferences } from './utils';
import { ExecutionRun } from '../execution/ExecutionRun';
import { filterOperatorDefinition } from '@maklja/vision-simulator-model';
import { Observable, filter } from 'rxjs';
import { defer } from 'rxjs';
import { Element, ElementType } from '@maklja/vision-simulator-model';
import {
	OperatorProps,
	PipeObservableFactory,
	PipeOperatorFactory,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue } from '../context';
import { mapOutputToFlowValue } from './utils';

const createFilterOperator = (el: Element, props: OperatorProps) => (o: Observable<FlowValue>) => {
	const filterFn = () => compileCallback<boolean>(el, props, 'predicateExpression');

	return o.pipe(mapOutputToFlowValue(filter(filterFn())));
};

const supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory> = new Map([
	[filterOperatorDefinition.type, createFilterOperator],
]);

export const filteringOperatorFactory: PipeOperatorFactory = {
	create(el: Element, props: OperatorProps): PipeObservableFactory {
		const factory = supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		const run = props.run ?? new ExecutionRun();
		return (source, subscriptionId) => {
			validateReferences(el, props);
			return defer(() => factory(run.resolve(el), { ...props, run, subscriptionId })(source));
		};
	},
	isSupported(el: Element): boolean {
		return supportedOperators.has(el.type);
	},
};
