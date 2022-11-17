import { from, interval, Observable, of } from 'rxjs';
import { Element, ElementType, FromElement, IntervalElement, OfElement } from '../../model';
import { CreationOperatorFactory } from './OperatorFactory';

type CreationOperatorFunctionFactory = (el: Element) => Observable<unknown>;

export class DefaultCreationOperatorFactory implements CreationOperatorFactory<unknown> {
	private readonly supportedOperators: ReadonlyMap<ElementType, CreationOperatorFunctionFactory>;

	constructor() {
		this.supportedOperators = new Map([
			[ElementType.Of, this.createOfCreationOperator],
			[ElementType.From, this.createFromCreationOperator],
			[ElementType.Interval, this.createIntervalCreationOperator],
		]);
	}

	create(el: Element): Observable<unknown> {
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
		return ofEl.items ? of(...ofEl.items) : of(ofEl.items);
	}

	private createFromCreationOperator(el: Element) {
		const fromEl = el as FromElement<unknown>;
		return from(fromEl.input);
	}

	private createIntervalCreationOperator(el: Element) {
		const intervalEl = el as IntervalElement;
		return interval(intervalEl.period);
	}
}

