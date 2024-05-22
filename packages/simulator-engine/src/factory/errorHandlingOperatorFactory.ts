import { v1 } from 'uuid';
import { Observable, ObservableInput, catchError, map } from 'rxjs';
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
		) => Observable<FlowValue> = new Function(
			OBSERVABLE_GENERATOR_NAME,
			`return ${catchEl.properties.selectorExpression}`,
		)(wrappedObservableGenerator);

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

