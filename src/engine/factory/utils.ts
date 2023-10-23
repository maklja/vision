import { OperatorFunction, concatMap, map, of } from 'rxjs';
import { FlowValue, FlowValueType } from '../context';

export const mapOutputToFlowValue = (operatorFn: OperatorFunction<unknown, unknown>) => {
	return concatMap((flowValue: FlowValue) =>
		of(flowValue.raw).pipe(
			operatorFn,
			map((value) => new FlowValue(value, flowValue.elementId, flowValue.type, flowValue.id)),
		),
	);
};

export const mapArrayOutputToFlowValue = (operatorFn: OperatorFunction<unknown, unknown[]>) => {
	return concatMap((flowValue: FlowValue) =>
		of(flowValue.raw).pipe(
			operatorFn,
			map(
				(rawValues: unknown[]) =>
					new FlowValue(rawValues, flowValue.elementId, flowValue.type, flowValue.id),
			),
		),
	);
};

export const mapFlowValuesArray = (elementId: string) => {
	return map(
		(flowValues: FlowValue[]) =>
			new FlowValue(
				flowValues.map((flowValue) => flowValue.raw),
				elementId,
				FlowValueType.Next,
			),
	);
};

