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
	ElementType,
	FromElement,
	GenerateElement,
	IifElement,
	IntervalElement,
	OfElement,
	RangeElement,
	ThrowErrorElement,
	TimerElement,
} from '../../model';
import {
	createContextFn,
	CreationOperatorFactory,
	CreationOperatorFunctionFactory,
	OperatorFactoryParams,
} from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import {
	InvalidElementPropertyValueError,
	MissingReferenceObservableError,
	UnsupportedElementTypeError,
} from '../errors';
import { isPropertyValueVariable, retrieveContextPropertyValue } from './utils';

export class DefaultCreationOperatorFactory implements CreationOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, CreationOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Ajax, this.createAjaxCreationOperator.bind(this)],
			[ElementType.Defer, this.createDeferCreationOperator.bind(this)],
			[ElementType.Of, this.createOfCreationOperator.bind(this)],
			[ElementType.From, this.createFromCreationOperator.bind(this)],
			[ElementType.Interval, this.createIntervalCreationOperator.bind(this)],
			[ElementType.IIf, this.createIifCreationOperator.bind(this)],
			[ElementType.Empty, this.createEmptyCreationOperator.bind(this)],
			[ElementType.Generate, this.createGenerateCreationOperator.bind(this)],
			[ElementType.Range, this.createRangeCreationOperator.bind(this)],
			[ElementType.ThrowError, this.createThrowErrorCreationOperator.bind(this)],
			[ElementType.Timer, this.createTimerCreationOperator.bind(this)],
		]);
	}

	create(params: OperatorFactoryParams): Observable<FlowValue> {
		const factory = this.supportedOperators.get(params.element.type);
		if (!factory) {
			throw new UnsupportedElementTypeError(
				params.element.id,
				params.element.type,
				ElementGroup.Creation,
			);
		}

		return factory(params);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createDeferCreationOperator({ element, context, options }: OperatorFactoryParams) {
		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				element.id,
				'Reference observable is required for defer operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for defer operator');
		}

		const deferEl = element as DeferElement;
		const [refObservable] = options.referenceObservables;
		return defer(() => {
			if (deferEl.properties.preInputObservableCreation) {
				createContextFn(deferEl.properties.preInputObservableCreation, context)();
			}

			refObservable.invokeTrigger?.(FlowValue.createEmptyValue(deferEl.id));
			return refObservable.observable;
		});
	}

	private createOfCreationOperator({ element, context }: OperatorFactoryParams) {
		const ofEl = element as OfElement;

		if (!ofEl.properties) {
			return of().pipe(
				map<unknown, FlowValue>((item) => this.createFlowValue(item, ofEl.id)),
			);
		}

		return defer(() => {
			const itemsFactoryFn = createContextFn(ofEl.properties.itemsFactory, context);

			return of(...itemsFactoryFn()).pipe(
				map<unknown, FlowValue>((item) => this.createFlowValue(item, ofEl.id)),
			);
		});
	}

	private createFromCreationOperator({ element, context, options }: OperatorFactoryParams) {
		const fromEl = element as FromElement;

		if (!fromEl.properties.enableObservableEvent) {
			const inputFn = createContextFn(fromEl.properties.input, context);
			return from(inputFn()).pipe(map((item) => this.createFlowValue(item, fromEl.id)));
		}

		if (options.referenceObservables.length === 0) {
			throw new MissingReferenceObservableError(
				element.id,
				'Reference observable is required for from operator',
			);
		}

		if (options.referenceObservables.length > 1) {
			throw new Error('Too many reference observables for from operator');
		}

		const [refObservable] = options.referenceObservables;
		return defer(() => {
			if (fromEl.properties.preInputObservableCreation) {
				createContextFn(fromEl.properties.preInputObservableCreation, context)();
			}

			refObservable.invokeTrigger?.(FlowValue.createEmptyValue(fromEl.id));
			return from(refObservable.observable);
		}).pipe(map((item) => this.createFlowValue(item, fromEl.id)));
	}

	private createIntervalCreationOperator({ element, context }: OperatorFactoryParams) {
		const intervalEl = element as IntervalElement;
		const { period } = intervalEl.properties;

		return defer(() => {
			const periodValue = isPropertyValueVariable(period)
				? retrieveContextPropertyValue<number>(period, context)
				: Number(period);

			return interval(periodValue).pipe(
				map((item) => this.createFlowValue(item, element.id)),
			);
		});
	}

	private createIifCreationOperator({ element, options, context }: OperatorFactoryParams) {
		const iifEl = element as IifElement;

		const trueRefObservable = options.referenceObservables.find(
			({ connectPoint }) =>
				connectPoint.connectPointType === ConnectPointType.Event &&
				connectPoint.connectPosition === ConnectPointPosition.Top,
		);
		if (!trueRefObservable) {
			throw new MissingReferenceObservableError(
				iifEl.id,
				'Not found true branch observable operator',
			);
		}

		const falseRefObservable = options.referenceObservables.find(
			({ connectPoint }) =>
				connectPoint.connectPointType === ConnectPointType.Event &&
				connectPoint.connectPosition === ConnectPointPosition.Bottom,
		);
		if (!falseRefObservable) {
			throw new MissingReferenceObservableError(
				iifEl.id,
				'Not found false branch observable operator',
			);
		}

		return defer(() => {
			const conditionFn = createContextFn(iifEl.properties.conditionExpression, context);

			return iif(
				conditionFn,
				defer(() => {
					if (iifEl.properties.truthyInputObservableCreation) {
						createContextFn(iifEl.properties.truthyInputObservableCreation, context)();
					}
					trueRefObservable.invokeTrigger?.(FlowValue.createEmptyValue(iifEl.id));
					return trueRefObservable.observable;
				}),
				defer(() => {
					if (iifEl.properties.falsyInputObservableCreation) {
						createContextFn(iifEl.properties.falsyInputObservableCreation, context)();
					}
					falseRefObservable.invokeTrigger?.(FlowValue.createEmptyValue(iifEl.id));
					return falseRefObservable.observable;
				}),
			);
		});
	}

	private createAjaxCreationOperator({ element }: OperatorFactoryParams) {
		const ajaxEl = element as AjaxElement;
		const { url, method, headers, queryParams, responseType, timeout, body } =
			ajaxEl.properties;
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
		}).pipe(map((item) => this.createFlowValue(item, ajaxEl.id)));
	}

	private createEmptyCreationOperator({ element }: OperatorFactoryParams) {
		return EMPTY.pipe(map((item) => this.createFlowValue(item, element.id)));
	}

	private createGenerateCreationOperator({ element, context }: OperatorFactoryParams) {
		const generateEl = element as GenerateElement;

		return defer(() => {
			const { initialState, iterate, resultSelector, condition } = generateEl.properties;

			const initialStateFn = createContextFn(initialState, context);
			const conditionFn = condition ? createContextFn(condition, context) : undefined;
			const iterateFn = createContextFn(iterate, context);
			const resultSelectorFn = createContextFn(resultSelector, context);

			return generate({
				initialState: initialStateFn(),
				condition: conditionFn,
				iterate: iterateFn,
				resultSelector: resultSelectorFn,
			}).pipe(map((item) => this.createFlowValue(item, generateEl.id)));
		});
	}

	private createThrowErrorCreationOperator({ element }: OperatorFactoryParams) {
		const throwErrorEl = element as ThrowErrorElement;
		const errorFactoryFn = new Function(
			`return ${throwErrorEl.properties.errorOrErrorFactory}`,
		)();

		return throwError(errorFactoryFn as () => unknown);
	}

	private createRangeCreationOperator({ element }: OperatorFactoryParams) {
		const rangeEl = element as RangeElement;
		const { start, count } = rangeEl.properties;
		return range(start, count).pipe(map((item) => this.createFlowValue(item, rangeEl.id)));
	}

	private createTimerCreationOperator({ element }: OperatorFactoryParams) {
		const timerEl = element as TimerElement;
		const startDue =
			timerEl.properties.dueDateType === DueDateType.Date
				? new Date(timerEl.properties.startDue)
				: timerEl.properties.startDue;
		return timer(startDue, timerEl.properties.intervalDuration).pipe(
			map((item) => this.createFlowValue(item, element.id)),
		);
	}

	private createFlowValue(value: unknown, elementId: string): FlowValue {
		return new FlowValue(value, elementId, FlowValueType.Next);
	}
}

