import { ConnectPointPosition } from '@maklja/vision-simulator-model';
import { MissingReferenceObservableError } from '../errors';
import { Element } from '@maklja/vision-simulator-model';
import { ExecutionRun, cloneInvocation } from '../execution/ExecutionRun';
import { OperatorProps } from './OperatorFactory';
import { OperatorFunction, concatMap, map, of } from 'rxjs';
import { ElementProps } from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { CreationObservableFactory } from './OperatorFactory';

export function wrapGeneratorCallback(
	observableFactory: CreationObservableFactory,
	subscribeId?: string,
) {
	return (overrideProps?: ElementProps) =>
		observableFactory(
			overrideProps === undefined ? undefined : cloneInvocation(overrideProps),
			subscribeId,
		);
}

export function mapOutputToFlowValue(operatorFn: OperatorFunction<unknown, unknown>) {
	return concatMap((flowValue: FlowValue) =>
		of(flowValue.raw).pipe(
			operatorFn,
			map((value) => flowValue.copy(value)),
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
	return map((flowValues: FlowValue[]) =>
		FlowValue.createNextEvent({
			value: flowValues.map((flowValue) => flowValue.raw),
			elementId,
			dependencies: flowValues.map((flowValue) => flowValue.id),
		}),
	);
}

export function compileCallback<T = unknown>(
	el: Element,
	props: OperatorProps,
	field: string,
	helper?: unknown,
): (...args: unknown[]) => T {
	return (props.run ?? new ExecutionRun()).callback(el, field, helper, props.subscriptionId) as (
		...args: unknown[]
	) => T;
}

/** Reference validation is structural and safe before trust/subscription. */
export function validateReferences(el: Element, props: OperatorProps) {
	const name = String(el.type);
	const needsOne =
		[
			'defer',
			'concatMap',
			'mergeMap',
			'exhaustMap',
			'expand',
			'buffer',
			'bufferWhen',
			'catchError',
		].includes(name) ||
		(name === 'from' && el.properties.enableObservableEvent === true);
	if (needsOne && props.refObservableGenerators.length !== 1) {
		if (!props.refObservableGenerators.length)
			throw new MissingReferenceObservableError(
				el.id,
				`Reference observable is required for ${name === 'exhaustMap' ? 'exhaust' : name} operator`,
			);
		throw new Error(
			`Too many reference observables for ${name === 'exhaustMap' ? 'exhaust' : name} operator`,
		);
	}
	if (name === 'iif' || name === 'bufferToggle') {
		for (const position of [ConnectPointPosition.Top, ConnectPointPosition.Bottom]) {
			if (
				!props.refObservableGenerators.some(
					(r) => r.connectPoint.connectPosition === position,
				)
			)
				throw new MissingReferenceObservableError(
					el.id,
					`Not found ${name === 'iif' ? (position === ConnectPointPosition.Top ? 'true' : 'false') : position === ConnectPointPosition.Top ? 'source' : 'closing'} branch observable operator`,
				);
		}
	}
}
