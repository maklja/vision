import { compileCallback, validateReferences } from './utils';
import { ExecutionRun } from '../execution/ExecutionRun';
import { v1 } from 'uuid';
import {
	catchError,
	defer,
	EMPTY,
	from,
	generate,
	iif,
	interval,
	map,
	Observable,
	of,
	range,
	throwError,
	timer,
} from 'rxjs';
import { ajax } from 'rxjs/ajax';
import {
	AjaxElement,
	AjaxElementProperties,
	ConnectPointPosition,
	ConnectPointType,
	DeferElement,
	DueDateType,
	Element,
	ElementGroup,
	ElementProps,
	ElementType,
	FromElement,
	FromElementProperties,
	GenerateElement,
	GenerateElementProperties,
	IifElement,
	IntervalElement,
	IntervalElementProperties,
	ajaxOperatorDefinition,
	emptyOperatorDefinition,
	generateOperatorDefinition,
	throwErrorOperatorDefinition,
	ofOperatorDefinition,
	iifOperatorDefinition,
	deferOperatorDefinition,
	fromOperatorDefinition,
	intervalOperatorDefinition,
	rangeOperatorDefinition,
	timerOperatorDefinition,
	RangeElement,
	RangeElementProperties,
	ThrowErrorElement,
	TimerElement,
	TimerElementProperties,
} from '@maklja/vision-simulator-model';
import {
	CreationObservableFactory,
	CreationOperatorFactory,
	OperatorProps,
} from './OperatorFactory';
import { FlowValue } from '../context';
import {
	InvalidElementPropertyValueError,
	MissingReferenceObservableError,
	UnsupportedElementTypeError,
} from '../errors';
import { wrapGeneratorCallback } from './utils';

const createFromCreationOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, parentSubscribeId?: string): Observable<FlowValue> => {
		const fromEl = el as FromElement;
		const fromElProperties: FromElementProperties = {
			...fromEl.properties,
			...overrideProperties,
		};

		if (!fromElProperties.enableObservableEvent) {
			const inputFn = () =>
				compileCallback<import('rxjs').ObservableInput<unknown>>(
					el,
					props,
					'inputCallbackExpression',
				);
			return from(inputFn()()).pipe(
				map((item) =>
					FlowValue.createNextEvent({
						value: item,
						elementId: el.id,
						subscribeId: parentSubscribeId,
					}),
				),
			);
		}

		if (props.refObservableGenerators.length === 0) {
			throw new MissingReferenceObservableError(
				fromEl.id,
				'Reference observable is required for from operator',
			);
		}

		if (props.refObservableGenerators.length > 1) {
			throw new Error('Too many reference observables for from operator');
		}

		const [refObservableGenerator] = props.refObservableGenerators;
		const subscribeId = v1();
		const wrappedObservableGenerator = wrapGeneratorCallback(
			refObservableGenerator.observableGenerator,
			subscribeId,
		);

		const observableRefInvokerFn: () => Observable<FlowValue> = compileCallback(
			el,
			props,
			'observableFactory',
			wrappedObservableGenerator,
		);
		return defer(() => {
			refObservableGenerator.onSubscribe?.(
				FlowValue.createSubscribeEvent({
					elementId: fromEl.id,
					id: subscribeId,
					subscribeId: parentSubscribeId,
				}),
			);
			return from(observableRefInvokerFn());
		});
	};

const createOfCreationOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, subscribeId?: string) => {
		const argsFn = (() => compileCallback(el, props, 'argsFactoryExpression'))();
		const args = argsFn();
		const observable = Array.isArray(args) ? of(...args) : of(args);
		return observable.pipe(
			map<unknown, FlowValue>((item) =>
				FlowValue.createNextEvent({
					value: item,
					elementId: el.id,
					subscribeId,
				}),
			),
		);
	};

const createIntervalCreationOperator =
	(el: Element) =>
	(overrideProperties?: ElementProps, subscribeId?: string): Observable<FlowValue> => {
		const intervalEl = el as IntervalElement;
		const intervalElProps: IntervalElementProperties = {
			...intervalEl.properties,
			...overrideProperties,
		};

		return interval(intervalElProps.period).pipe(
			map((item) =>
				FlowValue.createNextEvent({
					value: item,
					elementId: intervalEl.id,
					subscribeId,
				}),
			),
		);
	};

const createIifCreationOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, parentSubscribeId?: string): Observable<FlowValue> => {
		const iifEl = el as IifElement;
		const conditionFn = () => compileCallback<boolean>(el, props, 'conditionExpression');

		const trueRefObservableGenerator = props.refObservableGenerators.find(
			({ connectPoint }) =>
				connectPoint.connectPointType === ConnectPointType.Event &&
				connectPoint.connectPosition === ConnectPointPosition.Top,
		);
		if (!trueRefObservableGenerator) {
			throw new MissingReferenceObservableError(
				iifEl.id,
				'Not found true branch observable operator',
			);
		}

		const falseRefObservableGenerator = props.refObservableGenerators.find(
			({ connectPoint }) =>
				connectPoint.connectPointType === ConnectPointType.Event &&
				connectPoint.connectPosition === ConnectPointPosition.Bottom,
		);
		if (!falseRefObservableGenerator) {
			throw new MissingReferenceObservableError(
				iifEl.id,
				'Not found false branch observable operator',
			);
		}

		const subscribeId = v1();
		const trueWrappedObservableGenerator = wrapGeneratorCallback(
			trueRefObservableGenerator.observableGenerator,
			subscribeId,
		);
		const trueRefInvokerFn: () => Observable<FlowValue> = () =>
			compileCallback<Observable<FlowValue>>(
				el,
				props,
				'trueCallbackExpression',
				trueWrappedObservableGenerator,
			)();

		const falseWrappedObservableGenerator = wrapGeneratorCallback(
			falseRefObservableGenerator.observableGenerator,
			subscribeId,
		);
		const falseRefInvokerFn: () => Observable<FlowValue> = () =>
			compileCallback<Observable<FlowValue>>(
				el,
				props,
				'falseCallbackExpression',
				falseWrappedObservableGenerator,
			)();

		return iif(
			conditionFn(),
			defer(() => {
				trueRefObservableGenerator.onSubscribe?.(
					FlowValue.createSubscribeEvent({
						elementId: iifEl.id,
						id: subscribeId,
						subscribeId: parentSubscribeId,
					}),
				);
				return trueRefInvokerFn();
			}),
			defer(() => {
				falseRefObservableGenerator.onSubscribe?.(
					FlowValue.createSubscribeEvent({
						elementId: iifEl.id,
						id: subscribeId,
						subscribeId: parentSubscribeId,
					}),
				);
				return falseRefInvokerFn();
			}),
		);
	};

const createAjaxCreationOperator =
	(el: Element) =>
	(overrideProperties?: ElementProps, subscribeId?: string): Observable<FlowValue> => {
		const ajaxEl = el as AjaxElement;
		const ajaxElProperties: AjaxElementProperties = {
			...ajaxEl.properties,
			...overrideProperties,
		};
		const { url, method, headers, queryParams, responseType, timeout, body } = ajaxElProperties;
		let bodyJson: object | undefined;
		try {
			bodyJson = body ? JSON.parse(body) : undefined;
		} catch {
			throw new InvalidElementPropertyValueError(ajaxEl.id, 'body');
		}

		const headersPayload = headers?.reduce(
			(headers, [key, value]) => ({
				...headers,
				[key]: value,
			}),
			{},
		);

		const queryParamsMap =
			queryParams?.reduce((queryParams: Map<string, string | string[]>, [key, value]) => {
				const queryParam = queryParams.get(key);

				if (queryParam === undefined) {
					return queryParams.set(key, value);
				}

				if (Array.isArray(queryParam)) {
					return queryParams.set(key, [...queryParam, value]);
				}

				return queryParams.set(key, [queryParam, value]);
			}, new Map<string, string | string[]>()) ?? new Map<string, string | string[]>();
		const queryParametersPayload = [...queryParamsMap.entries()].reduce(
			(queryParams, [key, value]) => ({
				...queryParams,
				[key]: value,
			}),
			{},
		);

		return ajax({
			url,
			method,
			headers: headersPayload,
			queryParams: queryParametersPayload,
			responseType,
			timeout,
			body: bodyJson,
		}).pipe(
			map((item) =>
				FlowValue.createNextEvent({
					value: item,
					elementId: ajaxEl.id,
					subscribeId,
				}),
			),
		);
	};

const createEmptyCreationOperator =
	(el: Element) =>
	(_overrideProperties?: ElementProps, subscribeId?: string): Observable<FlowValue> => {
		return EMPTY.pipe(
			map((item) =>
				FlowValue.createNextEvent({
					value: item,
					elementId: el.id,
					subscribeId,
				}),
			),
		);
	};

const createDeferCreationOperator =
	(el: Element, props: OperatorProps) =>
	(_overrideProperties?: ElementProps, parentSubscribeId?: string): Observable<FlowValue> => {
		if (props.refObservableGenerators.length === 0) {
			throw new MissingReferenceObservableError(
				el.id,
				'Reference observable is required for defer operator',
			);
		}

		if (props.refObservableGenerators.length > 1) {
			throw new Error('Too many reference observables for defer operator');
		}

		const deferEl = el as DeferElement;
		const [refObservableGenerator] = props.refObservableGenerators;

		const subscribeId = v1();
		const wrappedObservableGenerator = wrapGeneratorCallback(
			refObservableGenerator.observableGenerator,
			subscribeId,
		);
		const observableRefInvokerFn: () => Observable<FlowValue> = compileCallback(
			el,
			props,
			'observableFactory',
			wrappedObservableGenerator,
		);
		return defer(() => {
			refObservableGenerator.onSubscribe?.(
				FlowValue.createSubscribeEvent({
					elementId: deferEl.id,
					id: subscribeId,
					subscribeId: parentSubscribeId,
				}),
			);
			return observableRefInvokerFn();
		});
	};

const createGenerateCreationOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, subscribeId?: string): Observable<FlowValue> => {
		const generateEl = el as GenerateElement;
		const generateElProperties: GenerateElementProperties = {
			...generateEl.properties,
			...overrideProperties,
		};
		const { condition } = generateElProperties;
		const initialStateFn = () => (props.run ?? new ExecutionRun()).evaluate(el, 'initialState');
		const conditionFn = condition
			? () => compileCallback<boolean>(el, props, 'condition')
			: undefined;
		const iterateFn = () => compileCallback(el, props, 'iterate');
		const resultSelectorFn = () => compileCallback(el, props, 'resultSelector');

		return generate({
			initialState: initialStateFn(),
			condition: conditionFn?.(),
			iterate: iterateFn(),
			resultSelector: resultSelectorFn(),
		}).pipe(
			map((item) =>
				FlowValue.createNextEvent({
					value: item,
					elementId: generateEl.id,
					subscribeId,
				}),
			),
		);
	};

const createThrowErrorCreationOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: ElementProps, subscribeId?: string): Observable<FlowValue> => {
		const throwErrorEl = el as ThrowErrorElement;
		const errorValue = (props.run ?? new ExecutionRun()).evaluate(el, 'errorOrErrorFactory');
		const errorFactoryFn = errorValue;

		return throwError(errorFactoryFn as () => unknown).pipe(
			catchError((error) => {
				throw FlowValue.createErrorEvent(error, throwErrorEl.id, subscribeId);
			}),
		);
	};

const createRangeCreationOperator =
	(el: Element) =>
	(overrideProperties?: ElementProps, subscribeId?: string): Observable<FlowValue> => {
		const rangeEl = el as RangeElement;
		const rangeElProperties: RangeElementProperties = {
			...rangeEl.properties,
			...overrideProperties,
		};

		return range(rangeElProperties.start, rangeElProperties.count).pipe(
			map((item) =>
				FlowValue.createNextEvent({
					value: item,
					elementId: rangeEl.id,
					subscribeId,
				}),
			),
		);
	};

const createTimerCreationOperator =
	(el: Element) =>
	(overrideProperties?: ElementProps, subscribeId?: string): Observable<FlowValue> => {
		const timerEl = el as TimerElement;
		const timerElProperties: TimerElementProperties = {
			...timerEl.properties,
			...overrideProperties,
		};

		const startDue =
			timerElProperties.dueDateType === DueDateType.Date
				? new Date(timerElProperties.startDue)
				: timerElProperties.startDue;
		return timer(startDue, timerElProperties.intervalDuration).pipe(
			map((item) =>
				FlowValue.createNextEvent({
					value: item,
					elementId: timerEl.id,
					subscribeId,
				}),
			),
		);
	};

type CreationOperatorFunctionFactory = (
	el: Element,
	props: OperatorProps,
) => CreationObservableFactory;

const supportedOperators: ReadonlyMap<ElementType, CreationOperatorFunctionFactory> = new Map([
	[ajaxOperatorDefinition.type, createAjaxCreationOperator],
	[deferOperatorDefinition.type, createDeferCreationOperator],
	[emptyOperatorDefinition.type, createEmptyCreationOperator],
	[fromOperatorDefinition.type, createFromCreationOperator],
	[generateOperatorDefinition.type, createGenerateCreationOperator],
	[iifOperatorDefinition.type, createIifCreationOperator],
	[intervalOperatorDefinition.type, createIntervalCreationOperator],
	[ofOperatorDefinition.type, createOfCreationOperator],
	[rangeOperatorDefinition.type, createRangeCreationOperator],
	[throwErrorOperatorDefinition.type, createThrowErrorCreationOperator],
	[timerOperatorDefinition.type, createTimerCreationOperator],
]);

export const creationOperatorFactory: CreationOperatorFactory = {
	create(el: Element, props: OperatorProps): CreationObservableFactory {
		const factory = supportedOperators.get(el.type);
		if (!factory) {
			throw new UnsupportedElementTypeError(el.id, el.type, ElementGroup.Creation);
		}

		const run = props.run ?? new ExecutionRun();
		return (overrides, subscribeId) => {
			validateReferences(el, props);
			return defer(() => {
				const resolved = run.resolve(el, overrides);
				return factory(resolved, { ...props, run, subscriptionId: subscribeId })(
					undefined,
					subscribeId,
				);
			});
		};
	},
	isSupported(el: Element): boolean {
		return supportedOperators.has(el.type);
	},
};
