import { v1 } from 'uuid';
import { Observable, ObservableInput, catchError } from 'rxjs';
import {
	CatchErrorElement,
	Element,
	ElementType,
	OBSERVABLE_GENERATOR_NAME,
} from '@maklja/vision-simulator-model';
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

		const catchEl = el as CatchErrorElement;
		const [refObservableGenerator] = props.refObservableGenerators;
		const subscribeId = v1();
		const wrappedObservableGenerator = wrapGeneratorCallback(
			refObservableGenerator.observableGenerator,
			subscribeId,
		);

		console.log(refObservableGenerator.observableGenerator, el.properties.observableFactory);
		const observableRefInvokerFn: () => Observable<FlowValue> = new Function(
			OBSERVABLE_GENERATOR_NAME,
			`return ${el.properties.observableFactory}`,
		)(wrappedObservableGenerator);

		return o.pipe(
			catchError<FlowValue, ObservableInput<FlowValue>>((error: FlowValue) => {
				// TODO error
				refObservableGenerator.onSubscribe?.(
					FlowValue.createSubscribeEvent({
						elementId: el.id,
						id: subscribeId,
						dependencies: [error.id],
					}),
				);
				console.log(observableRefInvokerFn, '+++', subscribeId, wrappedObservableGenerator);
				return observableRefInvokerFn();
			}),
		);
	};

const supportedOperators: ReadonlyMap<ElementType, PipeOperatorFunctionFactory> = new Map([
	[ElementType.CatchError, createCatchErrorOperator],
]);

export const errorHandlingOperatorFactory: PipeOperatorFactory = {
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
