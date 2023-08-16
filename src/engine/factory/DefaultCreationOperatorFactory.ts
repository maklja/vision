import { defer, EMPTY, from, iif, interval, map, Observable, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import {
	AjaxElement,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementType,
	EmptyElement,
	FromElement,
	IifElement,
	IntervalElement,
	OfElement,
} from '../../model';
import { CreationOperatorFactory, OperatorOptions } from './OperatorFactory';
import { FlowValue, FlowValueType } from '../context';
import { MissingReferenceObservableError } from '../errors';

type CreationOperatorFunctionFactory = (
	el: Element,
	options: OperatorOptions,
) => Observable<FlowValue>;

export class DefaultCreationOperatorFactory implements CreationOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, CreationOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Of, this.createOfCreationOperator.bind(this)],
			[ElementType.From, this.createFromCreationOperator.bind(this)],
			[ElementType.Interval, this.createIntervalCreationOperator.bind(this)],
			[ElementType.IIf, this.createIifCreationOperator.bind(this)],
			[ElementType.Ajax, this.createAjaxCreationOperator.bind(this)],
			[ElementType.Empty, this.createEmptyCreationOperator.bind(this)],
		]);
	}

	create(
		el: Element,
		options: OperatorOptions = { referenceObservables: [] },
	): Observable<FlowValue> {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as creation operator.`);
		}

		return factory(el, options);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createOfCreationOperator(el: Element) {
		const ofEl = el as OfElement<unknown>;
		const { items } = ofEl.properties;
		return items
			? of(...items).pipe(
					map<unknown, FlowValue>((item) => this.createFlowValue(item, ofEl.id)),
			  )
			: of(this.createFlowValue(null, ofEl.id));
	}

	private createFromCreationOperator(el: Element) {
		const fromEl = el as FromElement<unknown>;
		return from(fromEl.properties.input).pipe(
			map((item) => this.createFlowValue(item, fromEl.id)),
		);
	}

	private createIntervalCreationOperator(el: Element) {
		const intervalEl = el as IntervalElement;
		return interval(intervalEl.properties.period).pipe(
			map((item) => this.createFlowValue(item, el.id)),
		);
	}

	private createIifCreationOperator(el: Element, options: OperatorOptions) {
		const iifEl = el as IifElement;
		const conditionFn = new Function(`return ${iifEl.properties.conditionExpression}`);

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

		return iif(
			conditionFn(),
			defer(() => {
				trueRefObservable.invokeTrigger?.(FlowValue.createEmptyValue(iifEl.id));
				return trueRefObservable.observable;
			}),
			defer(() => {
				falseRefObservable.invokeTrigger?.(FlowValue.createEmptyValue(iifEl.id));
				return falseRefObservable.observable;
			}),
		);
	}

	private createAjaxCreationOperator(el: Element) {
		const ajaxEl = el as AjaxElement;
		return ajax(ajaxEl.properties).pipe(map((item) => this.createFlowValue(item, el.id)));
	}

	private createEmptyCreationOperator(el: Element) {
		const emptyEl = el as EmptyElement;
		return EMPTY.pipe(map((item) => this.createFlowValue(item, emptyEl.id)));
	}

	private createFlowValue(value: unknown, elementId: string): FlowValue {
		return new FlowValue(value, elementId, FlowValueType.Next);
	}
}
