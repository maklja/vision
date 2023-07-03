import { from, interval, map, Observable, of } from 'rxjs';
import { Element, ElementType, FromElement, IntervalElement, OfElement } from '../../model';
import { CreationOperatorFactory } from './OperatorFactory';
import { FlowValue } from '../context';

type CreationOperatorFunctionFactory = (el: Element) => Observable<FlowValue>;

export class DefaultCreationOperatorFactory implements CreationOperatorFactory {
	private readonly supportedOperators: ReadonlyMap<ElementType, CreationOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Of, this.createOfCreationOperator.bind(this)],
			[ElementType.From, this.createFromCreationOperator.bind(this)],
			[ElementType.Interval, this.createIntervalCreationOperator.bind(this)],
		]);
	}

	create(el: Element): Observable<FlowValue> {
		const factory = this.supportedOperators.get(el.type);
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as creation operator.`);
		}

		return factory(el);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.has(el.type);
	}

	private createOfCreationOperator(el: Element) {
		const ofEl = el as OfElement<unknown>;
		const { items } = ofEl.properties;
		return items
			? of(...items).pipe(map<unknown, FlowValue>((item) => this.createFlowValue(item)))
			: of(this.createFlowValue(null));
	}

	private createFromCreationOperator(el: Element) {
		const fromEl = el as FromElement<unknown>;
		return from(fromEl.properties.input).pipe(map((item) => this.createFlowValue(item)));
	}

	private createIntervalCreationOperator(el: Element) {
		const intervalEl = el as IntervalElement;
		return interval(intervalEl.properties.period).pipe(
			map((item) => this.createFlowValue(item)),
		);
	}

	private createFlowValue(value: unknown): FlowValue {
		return new FlowValue(value);
	}
}

