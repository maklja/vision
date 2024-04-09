import { Observable, ObservableInput, catchError } from 'rxjs';
import {
	OperatorProps,
	PipeObservableFactory,
	PipeOperatorFactory,
	PipeOperatorFunctionFactory,
} from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import { Element, ElementType } from '../../model';
import { MissingReferenceObservableError } from '../errors';

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

		const [refObservableGenerator] = props.refObservableGenerators;
		return o.pipe(
			catchError<FlowValue, ObservableInput<FlowValue>>((error) => {
				refObservableGenerator.onSubscribe?.({
					...error,
					type: FlowValueType.Next,
				});
				return refObservableGenerator.observableGenerator();
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

