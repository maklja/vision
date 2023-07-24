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
	IntervalElement,
	MergeElement,
	OfElement,
	ResultElement,
} from '../model';
import { SubscriberDrawer } from './subscriberOperators';
import { FilterOperatorDrawer } from './filteringOperators';
import { ResultDrawer } from './resultOperators';
import { MergeOperatorDrawer } from './joinCreationOperators';
import { isHighlightedElement, isSelectedElement, useThemeContext } from '../store/stageSlice';
import { useAppSelector } from '../store/rootState';
import { selectDrawerAnimationById } from '../store/drawerAnimationsSlice';
import { useElementDrawerHandlers } from './state';

export interface OperatorDrawerProps {
	element: Element;
	visibleConnectPoints?: boolean;
}

export const OperatorDrawer = ({ element, visibleConnectPoints }: OperatorDrawerProps) => {
	const theme = useThemeContext(element.type);
	const animation = useAppSelector(selectDrawerAnimationById(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const select = useAppSelector(isSelectedElement(element.id));
	const highlight = useAppSelector(isHighlightedElement(element.id));

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
					{...drawerHandlers}
					id={element.id}
					x={element.x}
					y={element.y}
					animation={animation}
					theme={theme}
					select={select}
					highlight={highlight}
					draggable={true}
					visibleConnectPoints={visibleConnectPoints}
				/>
			);
		case ElementType.IIf:
			return (
				<IifOperatorDrawer
					{...drawerHandlers}
					id={element.id}
					x={element.x}
					y={element.y}
					animation={animation}
					theme={theme}
					select={select}
					highlight={highlight}
					draggable={true}
					visibleConnectPoints={visibleConnectPoints}
				/>
			);
		case ElementType.Merge:
			return (
				<MergeOperatorDrawer
					element={element as MergeElement}
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
