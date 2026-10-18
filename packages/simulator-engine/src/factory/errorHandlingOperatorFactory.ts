import { compileCallback, validateReferences } from './utils';
import { ExecutionRun } from '../execution/ExecutionRun';
import { catchErrorOperatorDefinition } from '@maklja/vision-simulator-model';
import { v1 } from 'uuid';
import { Observable, ObservableInput, catchError, map } from 'rxjs';
import { defer } from 'rxjs';
import { CatchErrorElement, Element, ElementType } from '@maklja/vision-simulator-model';
import {
	OperatorProps,
	PipeObservableFactory,
	PipeOperatorFactory,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue } from '../context';
import { MissingReferenceObservableError } from '../errors';
import { wrapGeneratorCallback } from './utils';

const createCatchErrorOperator =
	(el: Element, props: OperatorProps) => (o: Observable<FlowValue>) => {
		if (props.refObservableGenerators.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for catchError operator',
			);
		}

		if (props.refObservableGenerators.length > 1) {
			throw new Error('Too many reference observables for catchError operator');
		}

		const subscribeId = v1();
		const catchEl = el as CatchErrorElement;
		const [refObservableGenerator] = props.refObservableGenerators;
		const wrappedObservableGenerator = wrapGeneratorCallback(
			refObservableGenerator.observableGenerator,
			subscribeId,
		);

		const observableRefInvokerFn: (
			err: unknown,
			caughtRaw: Observable<unknown>,
		) => Observable<FlowValue> = compileCallback(
			el,
			props,
			'selectorExpression',
			wrappedObservableGenerator,
		);

		return o.pipe(
			catchError<FlowValue, ObservableInput<FlowValue>>((error: FlowValue, caught) => {
				refObservableGenerator.onSubscribe?.(
					FlowValue.createSubscribeEvent({
						elementId: catchEl.id,
						id: subscribeId,
						dependencies: [error.id],
					}),
				);

				const caughtRaw = caught.pipe(map((flowValue) => flowValue.raw));
				return observableRefInvokerFn(error.raw, caughtRaw);
			}),
		);
	};

const supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory> = new Map([
	[catchErrorOperatorDefinition.type, createCatchErrorOperator],
]);

export const errorHandlingOperatorFactory: PipeOperatorFactory = {
	create(el: Element, props: OperatorProps): PipeObservableFactory {
		const factory = supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		const run = props.run ?? new ExecutionRun();
		return (source, subscriptionId) => {
			validateReferences(el, props);
			return defer(() =>
				factory(run.resolve(el, undefined, subscriptionId), {
					...props,
					run,
					subscriptionId,
				})(source),
			);
		};
	},

	isSupported(el: Element): boolean {
		return supportedOperators.has(el.type);
	},
};
