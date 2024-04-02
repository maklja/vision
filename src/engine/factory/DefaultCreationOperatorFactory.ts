import {
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
	EmptyElement,
	FromElement,
	FromElementProperties,
	GenerateElement,
	GenerateElementProperties,
	IifElement,
	IifElementProperties,
	IntervalElement,
	IntervalElementProperties,
	NEXT_GENERATOR_NAME,
	OfElement,
	OfElementProperties,
	RangeElement,
	RangeElementProperties,
	ThrowErrorElement,
	ThrowErrorElementProperties,
	TimerElement,
	TimerElementProperties,
} from '../../model';
import {
	CreationObservableFactory,
	CreationOperatorFactory,
	OperatorProps,
} from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import {
	InvalidElementPropertyValueError,
	MissingReferenceObservableError,
	UnsupportedElementTypeError,
} from '../errors';

function createFlowValue(value: unknown, elementId: string): FlowValue {
	return new FlowValue(value, elementId, FlowValueType.Next);
}

const createFromCreationOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: Partial<ElementProps>): Observable<FlowValue> => {
		const fromEl = el as FromElement;
		const fromElProperties: FromElementProperties = {
			...fromEl.properties,
			...overrideProperties,
		};

		if (!fromElProperties.enableObservableEvent) {
			const inputFn = new Function(`return ${fromElProperties.inputCallbackExpression}`);
			return from(inputFn()()).pipe(map((item) => createFlowValue(item, fromEl.id)));
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
		const observableRefInvokerFn: () => Observable<FlowValue> = new Function(
			NEXT_GENERATOR_NAME,
			`return ${fromElProperties.observableFactory}`,
		)(refObservableGenerator.observableGenerator);
		return defer(() => {
			refObservableGenerator.onSubscribe?.(FlowValue.createEmptyValue(fromEl.id));
			return from(observableRefInvokerFn());
		}).pipe(map((item) => createFlowValue(item, fromEl.id)));
	};

const createOfCreationOperator = (el: Element) => (overrideProperties?: Partial<ElementProps>) => {
	const ofEl = el as OfElement;
	const ofElProperties: OfElementProperties = {
		...ofEl.properties,
		...overrideProperties,
	};

	const items = ofElProperties?.items;
	return items
		? of(...items).pipe(map<unknown, FlowValue>((item) => createFlowValue(item, ofEl.id)))
		: of(createFlowValue(null, ofEl.id));
};

const createIntervalCreationOperator =
	(el: Element) =>
	(overrideProperties?: Partial<ElementProps>): Observable<FlowValue> => {
		const intervalEl = el as IntervalElement;
		const intervalElProps: IntervalElementProperties = {
			...intervalEl.properties,
			...overrideProperties,
		};

		return interval(intervalElProps.period).pipe(map((item) => createFlowValue(item, el.id)));
	};

const createIifCreationOperator =
	(el: Element, props: OperatorProps) =>
	(overrideProperties?: Partial<ElementProps>): Observable<FlowValue> => {
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

		const trueRefInvokerFn: () => Observable<FlowValue> = new Function(
			NEXT_GENERATOR_NAME,
			`return ${iifElProps.trueCallbackExpression}`,
		)(trueRefObservableGenerator.observableGenerator);
		const falseRefInvokerFn: () => Observable<FlowValue> = new Function(
			NEXT_GENERATOR_NAME,
			`return ${iifElProps.falseCallbackExpression}`,
		)(falseRefObservableGenerator.observableGenerator);

		return iif(
			conditionFn(),
			defer(() => {
				trueRefObservableGenerator.onSubscribe?.(FlowValue.createEmptyValue(iifEl.id));
				return trueRefInvokerFn();
			}),
			defer(() => {
				falseRefObservableGenerator.onSubscribe?.(FlowValue.createEmptyValue(iifEl.id));
				return falseRefInvokerFn();
			}),
		);
	};

const createAjaxCreationOperator =
	(el: Element) =>
	(overrideProperties?: Partial<ElementProps>): Observable<FlowValue> => {
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
		}).pipe(map((item) => createFlowValue(item, ajaxEl.id)));
	};

const createEmptyCreationOperator = (el: Element) => (): Observable<FlowValue> => {
	const emptyEl = el as EmptyElement;
	return EMPTY.pipe(map((item) => createFlowValue(item, emptyEl.id)));
};

const createDeferCreationOperator =
	(el: Element, props: OperatorProps) => (): Observable<FlowValue> => {
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
		const observableRefInvokerFn: () => Observable<FlowValue> = new Function(
			NEXT_GENERATOR_NAME,
			`return ${el.properties.observableFactory}`,
		)(refObservableGenerator.observableGenerator);
		return defer(() => {
			refObservableGenerator.onSubscribe?.(FlowValue.createEmptyValue(deferEl.id));
			return observableRefInvokerFn();
		});
	};

const createGenerateCreationOperator =
	(el: Element) =>
	(overrideProperties?: Partial<ElementProps>): Observable<FlowValue> => {
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
		}).pipe(map((item) => createFlowValue(item, generateEl.id)));
	};

const createThrowErrorCreationOperator =
	(el: Element) =>
	(overrideProperties?: Partial<ElementProps>): Observable<FlowValue> => {
		const throwErrorEl = el as ThrowErrorElement;
		const throwErrorElProperties: ThrowErrorElementProperties = {
			...throwErrorEl.properties,
			...overrideProperties,
		};
		const errorFactoryFn = new Function(
			`return ${throwErrorElProperties.errorOrErrorFactory}`,
		)();

		return throwError(errorFactoryFn as () => unknown);
	};

const createRangeCreationOperator =
	(el: Element) =>
	(overrideProperties?: Partial<ElementProps>): Observable<FlowValue> => {
		const rangeEl = el as RangeElement;
		const rangeElProperties: RangeElementProperties = {
			...rangeEl.properties,
			...overrideProperties,
		};

		return range(rangeElProperties.start, rangeElProperties.count).pipe(
			map((item) => createFlowValue(item, rangeEl.id)),
		);
	};

const createTimerCreationOperator =
	(el: Element) =>
	(overrideProperties?: Partial<ElementProps>): Observable<FlowValue> => {
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
			map((item) => createFlowValue(item, el.id)),
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
