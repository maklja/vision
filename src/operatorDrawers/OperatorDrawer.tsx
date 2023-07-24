import {
	FromOperatorDrawer,
	IifOperatorDrawer,
	IntervalOperatorDrawer,
	OfOperatorDrawer,
} from './creationOperators';
import { CatchErrorOperatorDrawer } from './errorHandlingOperators';
import { Element, ElementType, ResultElement } from '../model';
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
		case ElementType.CatchError:
			return (
				<CatchErrorOperatorDrawer
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
		case ElementType.Interval:
			return (
				<IntervalOperatorDrawer
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
		case ElementType.Of:
			return (
				<OfOperatorDrawer
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
		case ElementType.Subscriber:
			return (
				<SubscriberDrawer
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
		case ElementType.Result:
			return (
				<ResultDrawer
					{...drawerHandlers}
					id={element.id}
					x={element.x}
					y={element.y}
					animation={animation}
					theme={theme}
					select={select}
					highlight={highlight}
					draggable={true}
					hash={(element as ResultElement).properties.hash}
				/>
			);
		default:
			return null;
	}
};

