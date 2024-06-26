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
	IifElementProperties,
	IntervalElement,
	IntervalElementProperties,
	OBSERVABLE_GENERATOR_NAME,
	OfElement,
	OfElementProperties,
	RangeElement,
	RangeElementProperties,
	ThrowErrorElement,
	ThrowErrorElementProperties,
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
			const inputFn = new Function(`return ${fromElProperties.inputCallbackExpression}`);
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

		const observableRefInvokerFn: () => Observable<FlowValue> = new Function(
			OBSERVABLE_GENERATOR_NAME,
			`return ${fromElProperties.observableFactory}`,
		)(wrappedObservableGenerator);
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
	(el: Element) => (overrideProperties?: ElementProps, subscribeId?: string) => {
		const ofEl = el as OfElement;
		const ofElProperties: OfElementProperties = {
			...ofEl.properties,
			...overrideProperties,
		};

		const argsFn = new Function(`return ${ofElProperties.argsFactoryExpression}`)();
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
		const iifElProps: IifElementProperties = {
			...iifEl.properties,
			...overrideProperties,
		};
		const conditionFn = new Function(`return ${iifEl.properties.conditionExpression}`);

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
		const trueRefInvokerFn: () => Observable<FlowValue> = new Function(
			OBSERVABLE_GENERATOR_NAME,
			`return ${iifElProps.trueCallbackExpression}`,
		)(trueWrappedObservableGenerator);

		const falseWrappedObservableGenerator = wrapGeneratorCallback(
			falseRefObservableGenerator.observableGenerator,
			subscribeId,
		);
		const falseRefInvokerFn: () => Observable<FlowValue> = new Function(
			OBSERVABLE_GENERATOR_NAME,
			`return ${iifElProps.falseCallbackExpression}`,
		)(falseWrappedObservableGenerator);

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
		} catch (e) {
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
		const observableRefInvokerFn: () => Observable<FlowValue> = new Function(
			OBSERVABLE_GENERATOR_NAME,
			`return ${el.properties.observableFactory}`,
		)(wrappedObservableGenerator);
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
	(el: Element) =>
	(overrideProperties?: ElementProps, subscribeId?: string): Observable<FlowValue> => {
		const generateEl = el as GenerateElement;
		const generateElProperties: GenerateElementProperties = {
			...generateEl.properties,
			...overrideProperties,
		};
		const { initialState, iterate, resultSelector, condition } = generateElProperties;
		const initialStateFn = new Function(`return ${initialState}`);
		const conditionFn = condition ? new Function(`return ${condition}`) : undefined;
		const iterateFn = new Function(`return ${iterate}`);
		const resultSelectorFn = new Function(`return ${resultSelector}`);

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
	(el: Element) =>
	(overrideProperties?: ElementProps, subscribeId?: string): Observable<FlowValue> => {
		const throwErrorEl = el as ThrowErrorElement;
		const throwErrorElProperties: ThrowErrorElementProperties = {
			...throwErrorEl.properties,
			...overrideProperties,
		};
		const errorFactoryFn = new Function(
			`return ${throwErrorElProperties.errorOrErrorFactory}`,
		)();

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
	[ElementType.Ajax, createAjaxCreationOperator],
	[ElementType.Defer, createDeferCreationOperator],
	[ElementType.Empty, createEmptyCreationOperator],
	[ElementType.From, createFromCreationOperator],
	[ElementType.Generate, createGenerateCreationOperator],
	[ElementType.IIf, createIifCreationOperator],
	[ElementType.Interval, createIntervalCreationOperator],
	[ElementType.Of, createOfCreationOperator],
	[ElementType.Range, createRangeCreationOperator],
	[ElementType.ThrowError, createThrowErrorCreationOperator],
	[ElementType.Timer, createTimerCreationOperator],
]);

export const creationOperatorFactory: CreationOperatorFactory = {
	create(el: Element, props: OperatorProps): CreationObservableFactory {
		const factory = supportedOperators.get(el.type);
		if (!factory) {
			throw new UnsupportedElementTypeError(el.id, el.type, ElementGroup.Creation);
		}

		return factory(el, props);
	},
	isSupported(el: Element): boolean {
		return supportedOperators.has(el.type);
	},
};
