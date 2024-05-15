import { OperatorFunction, concatMap, map, of } from 'rxjs';
import { ElementProps, FlowValueType } from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { CreationObservableFactory } from './OperatorFactory';

export function createFlowValue(value: unknown, elementId: string): FlowValue {
	return new FlowValue(value, elementId, FlowValueType.Next);
}

export function wrapGeneratorCallback(
	observableFactory: CreationObservableFactory,
	subscribeId?: string,
) {
	return (overrideProps?: ElementProps) => observableFactory(overrideProps, subscribeId);
}

export function mapOutputToFlowValue(operatorFn: OperatorFunction<unknown, unknown>) {
	return concatMap((flowValue: FlowValue) =>
		of(flowValue.raw).pipe(
			operatorFn,
			map((value) => new FlowValue(value, flowValue.elementId, flowValue.type, flowValue.id)),
		),
	);
}

export function mapArrayOutputToFlowValue(operatorFn: OperatorFunction<unknown, unknown[]>) {
	return concatMap((flowValue: FlowValue) =>
		of(flowValue.raw).pipe(
			operatorFn,
			map(
				(rawValues: unknown[]) =>
					new FlowValue(rawValues, flowValue.elementId, flowValue.type, flowValue.id),
			),
		),
	);
}

export function mapFlowValuesArray(elementId: string) {
	return map(
		(flowValues: FlowValue[]) =>
			new FlowValue(
				flowValues.map((flowValue) => flowValue.raw),
				elementId,
				FlowValueType.Next,
			),
	);
}

