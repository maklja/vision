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
import { selectDrawerAnimationByDrawerId } from '../store/drawerAnimationsSlice';
import { useElementDrawerHandlers } from './state';
import { ElementDrawerProps } from './ElementDrawerProps';
import { animationRegistry } from '../animation';
import {
	ConcatMapOperatorDrawer,
	MapOperatorDrawer,
	MergeMapOperatorDrawer,
} from './transformationOperators';

export const createOperatorDrawer = (elType: ElementType, props: ElementDrawerProps) => {
	switch (elType) {
		case ElementType.Filter:
			return <FilterOperatorDrawer {...props} />;
		case ElementType.CatchError:
			return <CatchErrorOperatorDrawer {...props} />;
		case ElementType.Interval:
			return <IntervalOperatorDrawer {...props} />;
		case ElementType.Of:
			return <OfOperatorDrawer {...props} />;
		case ElementType.From:
			return <FromOperatorDrawer {...props} />;
		case ElementType.IIf:
			return <IifOperatorDrawer {...props} />;
		case ElementType.Merge:
			return <MergeOperatorDrawer {...props} />;
		case ElementType.Subscriber:
			return <SubscriberDrawer {...props} />;
		case ElementType.Map:
			return <MapOperatorDrawer {...props} />;
		case ElementType.ConcatMap:
			return <ConcatMapOperatorDrawer {...props} />;
		case ElementType.MergeMap:
			return <MergeMapOperatorDrawer {...props} />;
		default:
			return null;
	}
};

export interface OperatorDrawerProps {
	element: Element;
	visibleConnectPoints?: boolean;
	draggable: boolean;
}

export const OperatorDrawer = ({
	element,
	visibleConnectPoints,
	draggable,
}: OperatorDrawerProps) => {
	const theme = useThemeContext(element.type);
	const animation = useAppSelector(selectDrawerAnimationByDrawerId(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const select = useAppSelector(isSelectedElement(element.id));
	const highlight = useAppSelector(isHighlightedElement(element.id));

	const animationConfig = animation
		? {
				...animationRegistry.retrieveAnimationConfig(animation.key)(theme, animation.data),
				id: animation.id,
				dispose: animation.dispose,
		  }
		: null;

	switch (element.type) {
		case ElementType.Of:
		case ElementType.Filter:
		case ElementType.CatchError:
		case ElementType.Interval:
		case ElementType.From:
		case ElementType.Subscriber:
		case ElementType.Merge:
		case ElementType.IIf:
		case ElementType.Map:
		case ElementType.ConcatMap:
		case ElementType.MergeMap:
			return createOperatorDrawer(element.type, {
				...drawerHandlers,
				id: element.id,
				x: element.x,
				y: element.y,
				scale: element.scale,
				visible: element.visible,
				animation: animationConfig,
				theme,
				select,
				highlight,
				draggable,
				visibleConnectPoints,
			});
		case ElementType.Result:
			return (
				<ResultDrawer
					{...drawerHandlers}
					id={element.id}
					x={element.x}
					y={element.y}
					scale={element.scale}
					visible={element.visible}
					animation={animationConfig}
					theme={theme}
					select={select}
					highlight={highlight}
					draggable={draggable}
					hash={(element as ResultElement).properties.hash}
				/>
			);
		default:
			return null;
	}
};
