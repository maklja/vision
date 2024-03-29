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
	GenerateElement,
	IifElement,
	IifElementProperties,
	IntervalElement,
	IntervalElementProperties,
	NEXT_GENERATOR_NAME,
	OfElement,
	OfElementProperties,
	RangeElement,
	ThrowErrorElement,
	TimerElement,
} from '../../model';
import {
	CreationObservableFactory,
	CreationOperatorFactory,
	OperatorOptions,
	OperatorProps,
} from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import {
	InvalidElementPropertyValueError,
	MissingReferenceObservableError,
	UnsupportedElementTypeError,
} from '../errors';

type CreationOperatorFunctionFactory = (
	el: Element,
	props: OperatorProps,
) => CreationObservableFactory;

export class DefaultCreationOperatorFactory implements CreationOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, CreationOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Of, this.createOfCreationOperator.bind(this)],
			// [ElementType.From, this.createFromCreationOperator.bind(this)],
			[ElementType.Interval, this.createIntervalCreationOperator.bind(this)],
			[ElementType.IIf, this.createIifCreationOperator.bind(this)],
			// [ElementType.Ajax, this.createAjaxCreationOperator.bind(this)],
			// [ElementType.Empty, this.createEmptyCreationOperator.bind(this)],
			// [ElementType.Defer, this.createDeferCreationOperator.bind(this)],
			// [ElementType.Generate, this.createGenerateCreationOperator.bind(this)],
			// [ElementType.Range, this.createRangeCreationOperator.bind(this)],
			// [ElementType.ThrowError, this.createThrowErrorCreationOperator.bind(this)],
			// [ElementType.Timer, this.createTimerCreationOperator.bind(this)],
		]);
	}

	create(el: Element, props: OperatorProps): CreationObservableFactory {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new UnsupportedElementTypeError(el.id, el.type, ElementGroup.Creation);
		}

		return factory(el, props);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createOfCreationOperator(el: Element) {
		return (overrideProperties?: ElementProps) => {
			const ofEl = el as OfElement;
			const ofOverrideProps = overrideProperties as OfElementProperties;
			const items = ofOverrideProps?.items ?? ofEl.properties.items;

			return items
				? of(...items).pipe(
						map<unknown, FlowValue>((item) => this.createFlowValue(item, ofEl.id)),
				  )
				: of(this.createFlowValue(null, ofEl.id));
		};
	}

	// private createFromCreationOperator(el: Element, options: OperatorOptions) {
	// 	const { id, properties } = el as FromElement;

	// 	if (!properties.enableObservableEvent) {
	// 		const inputFn = new Function(`return ${properties.input}`);
	// 		return from(inputFn()()).pipe(map((item) => this.createFlowValue(item, id)));
	// 	}

	// 	if (options.referenceObservables.length === 0) {
	// 		throw new MissingReferenceObservableError(
	// 			el.id,
	// 			'Reference observable is required for from operator',
	// 		);
	// 	}

	// 	if (options.referenceObservables.length > 1) {
	// 		throw new Error('Too many reference observables for from operator');
	// 	}

	// 	const [refObservable] = options.referenceObservables;
	// 	return defer(() => {
	// 		refObservable.invokeTrigger?.(FlowValue.createEmptyValue(id));
	// 		return from(refObservable.observable);
	// 	}).pipe(map((item) => this.createFlowValue(item, id)));
	// }

	private createIntervalCreationOperator(el: Element) {
		return (overrideProperties?: ElementProps): Observable<FlowValue> => {
			const intervalEl = el as IntervalElement;
			const intervalElProps = (overrideProperties ??
				intervalEl.properties) as IntervalElementProperties;

			return interval(intervalElProps.period).pipe(
				map((item) => this.createFlowValue(item, el.id)),
			);
		};
	}

	private createIifCreationOperator(el: Element, props: OperatorProps) {
		return (overrideProperties?: ElementProps): Observable<FlowValue> => {
			const iifEl = el as IifElement;
			const elProps = (overrideProperties ?? iifEl.properties) as IifElementProperties;
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
				`return ${elProps.trueCallbackExpression}`,
			)(trueRefObservableGenerator.observableGenerator);
			const falseRefInvokerFn: () => Observable<FlowValue> = new Function(
				NEXT_GENERATOR_NAME,
				`return ${elProps.falseCallbackExpression}`,
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
	}

	// private createAjaxCreationOperator(el: Element) {
	// 	const ajaxEl = el as AjaxElement;
	// 	const { url, method, headers, queryParams, responseType, timeout, body } =
	// 		ajaxEl.properties;
	// 	let bodyJson: object | undefined;
	// 	try {
	// 		bodyJson = body ? JSON.parse(body) : undefined;
	// 	} catch (e) {
	// 		throw new InvalidElementPropertyValueError(ajaxEl.id, 'body');
	// 	}

	// 	const headersPayload = headers?.reduce(
	// 		(headers, [key, value]) => ({
	// 			...headers,
	// 			[key]: value,
	// 		}),
	// 		{},
	// 	);

	// 	const queryParamsMap =
	// 		queryParams?.reduce((queryParams: Map<string, string | string[]>, [key, value]) => {
	// 			const queryParam = queryParams.get(key);

	// 			if (queryParam === undefined) {
	// 				return queryParams.set(key, value);
	// 			}

	// 			if (Array.isArray(queryParam)) {
	// 				return queryParams.set(key, [...queryParam, value]);
	// 			}

	// 			return queryParams.set(key, [queryParam, value]);
	// 		}, new Map<string, string | string[]>()) ?? new Map<string, string | string[]>();
	// 	const queryParametersPayload = [...queryParamsMap.entries()].reduce(
	// 		(queryParams, [key, value]) => ({
	// 			...queryParams,
	// 			[key]: value,
	// 		}),
	// 		{},
	// 	);

	// 	return ajax({
	// 		url,
	// 		method,
	// 		headers: headersPayload,
	// 		queryParams: queryParametersPayload,
	// 		responseType,
	// 		timeout,
	// 		body: bodyJson,
	// 	}).pipe(map((item) => this.createFlowValue(item, ajaxEl.id)));
	// }

	// private createEmptyCreationOperator(el: Element) {
	// 	const emptyEl = el as EmptyElement;
	// 	return EMPTY.pipe(map((item) => this.createFlowValue(item, emptyEl.id)));
	// }

	// private createDeferCreationOperator(el: Element, options: OperatorOptions) {
	// 	if (options.referenceObservables.length === 0) {
	// 		throw new MissingReferenceObservableError(
	// 			el.id,
	// 			'Reference observable is required for defer operator',
	// 		);
	// 	}

	// 	if (options.referenceObservables.length > 1) {
	// 		throw new Error('Too many reference observables for defer operator');
	// 	}

	// 	const deferEl = el as DeferElement;
	// 	const [refObservable] = options.referenceObservables;
	// 	return defer(() => {
	// 		refObservable.invokeTrigger?.(FlowValue.createEmptyValue(deferEl.id));
	// 		return refObservable.observable;
	// 	});
	// }

	// private createGenerateCreationOperator(el: Element) {
	// 	const generateEl = el as GenerateElement;
	// 	const { initialState, iterate, resultSelector, condition } = generateEl.properties;
	// 	const initialStateFn = new Function(`return ${initialState}`);
	// 	const conditionFn = condition ? new Function(`return ${condition}`) : undefined;
	// 	const iterateFn = new Function(`return ${iterate}`);
	// 	const resultSelectorFn = new Function(`return ${resultSelector}`);

	// 	return generate({
	// 		initialState: initialStateFn(),
	// 		condition: conditionFn?.(),
	// 		iterate: iterateFn(),
	// 		resultSelector: resultSelectorFn(),
	// 	}).pipe(map((item) => this.createFlowValue(item, generateEl.id)));
	// }

	// private createThrowErrorCreationOperator(el: Element) {
	// 	const throwErrorEl = el as ThrowErrorElement;
	// 	const errorFactoryFn = new Function(
	// 		`return ${throwErrorEl.properties.errorOrErrorFactory}`,
	// 	)();

	// 	return throwError(errorFactoryFn as () => unknown);
	// }

	// private createRangeCreationOperator(el: Element) {
	// 	const rangeEl = el as RangeElement;
	// 	const { start, count } = rangeEl.properties;
	// 	return range(start, count).pipe(map((item) => this.createFlowValue(item, rangeEl.id)));
	// }

	// private createTimerCreationOperator(el: Element) {
	// 	const timerEl = el as TimerElement;
	// 	const startDue =
	// 		timerEl.properties.dueDateType === DueDateType.Date
	// 			? new Date(timerEl.properties.startDue)
	// 			: timerEl.properties.startDue;
	// 	return timer(startDue, timerEl.properties.intervalDuration).pipe(
	// 		map((item) => this.createFlowValue(item, el.id)),
	// 	);
	// }

	private createFlowValue(value: unknown, elementId: string): FlowValue {
		return new FlowValue(value, elementId, FlowValueType.Next);
	}
}

