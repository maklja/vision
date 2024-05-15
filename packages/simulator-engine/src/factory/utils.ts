import { OperatorFunction, concatMap, map, of } from 'rxjs';
import { ElementProps, FlowValueType } from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { CreationObservableFactory } from './OperatorFactory';

export function wrapGeneratorCallback(
	observableFactory: CreationObservableFactory,
	branchId?: string,
) {
	return (overrideProps?: ElementProps) => observableFactory(overrideProps, branchId);
}

export function createFlowValue(value: unknown, elementId: string, instanceId: string): FlowValue {
	return new FlowValue(value, elementId, instanceId, FlowValueType.Next);
}

export function mapOutputToFlowValue(operatorFn: OperatorFunction<unknown, unknown>) {
	return concatMap((flowValue: FlowValue) =>
		of(flowValue.raw).pipe(
			operatorFn,
			map(
				(value) =>
					new FlowValue(
						value,
						flowValue.elementId,
						flowValue.branchId,
						flowValue.type,
						flowValue.id,
					),
			),
		),
	);
}

export function mapArrayOutputToFlowValue(operatorFn: OperatorFunction<unknown, unknown[]>) {
	return concatMap((flowValue: FlowValue) =>
		of(flowValue.raw).pipe(
			operatorFn,
			map(
				(rawValues: unknown[]) =>
					new FlowValue(
						rawValues,
						flowValue.elementId,
						flowValue.branchId,
						flowValue.type,
						flowValue.id,
					),
			),
		),
	);
}

export function mapFlowValuesArray(elementId: string, branchId?: string) {
	return map((flowValues: FlowValue[]) => {
		console.log(flowValues);
		return new FlowValue(
			flowValues.map((flowValue) => flowValue.raw),
			elementId,
			branchId ?? flowValues[0].branchId,
			FlowValueType.Next,
		);
	});
}

