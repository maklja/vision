import {
	FromOperatorDrawer,
	IifOperatorDrawer,
	IntervalOperatorDrawer,
	OfOperatorDrawer,
} from './creationOperators';
import { CatchErrorOperatorDrawer } from './errorHandlingOperators';
import {
	CatchErrorElement,
	Element,
	ElementType,
	FilterElement,
	FromElement,
	IifElement,
	IntervalElement,
	OfElement,
	ResultElement,
} from '../model';
import { SubscriberDrawer } from './subscriberOperators';
import { FilterOperatorDrawer } from './filteringOperators';
import { ResultDrawer } from './resultOperators';

export interface ElementDrawerWrapperProps {
	element: Element;
	visibleConnectPoints?: boolean;
}

export const ElementWrapperDrawer = ({
	element,
	visibleConnectPoints,
}: ElementDrawerWrapperProps) => {
	switch (element.type) {
		case ElementType.Filter:
			return (
				<FilterOperatorDrawer
					element={element as FilterElement}
					visibleConnectPoints={visibleConnectPoints}
				/>
			);
		case ElementType.CatchError:
			return (
				<CatchErrorOperatorDrawer
					element={element as CatchErrorElement}
					visibleConnectPoints={visibleConnectPoints}
				/>
			);
		case ElementType.Interval:
			return (
				<IntervalOperatorDrawer
					element={element as IntervalElement}
					visibleConnectPoints={visibleConnectPoints}
				/>
			);
		case ElementType.Of:
			return (
				<OfOperatorDrawer
					element={element as OfElement}
					visibleConnectPoints={visibleConnectPoints}
				/>
			);
		case ElementType.From:
			return (
				<FromOperatorDrawer
					element={element as FromElement}
					visibleConnectPoints={visibleConnectPoints}
				/>
			);
		case ElementType.IIf:
			return (
				<IifOperatorDrawer
					element={element as IifElement}
					visibleConnectPoints={visibleConnectPoints}
				/>
			);
		case ElementType.Subscriber:
			return (
				<SubscriberDrawer element={element} visibleConnectPoints={visibleConnectPoints} />
			);
		case ElementType.Result:
			return <ResultDrawer element={element as ResultElement} />;
		default:
			return null;
	}
};

