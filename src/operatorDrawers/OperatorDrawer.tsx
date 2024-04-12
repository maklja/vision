import {
	AjaxOperatorDrawer,
	DeferOperatorDrawer,
	EmptyOperatorDrawer,
	FromOperatorDrawer,
	GenerateOperatorDrawer,
	IifOperatorDrawer,
	IntervalOperatorDrawer,
	OfOperatorDrawer,
	RangeOperatorDrawer,
	ThrowErrorOperatorDrawer,
	TimerOperatorDrawer,
} from './creationOperators';
import { CatchErrorOperatorDrawer } from './errorHandlingOperators';
import { Element, ElementType, ResultElement } from '../model';
import { SubscriberDrawer } from './subscriberOperators';
import { FilterOperatorDrawer } from './filteringOperators';
import { ResultDrawer } from './resultOperators';
import {
	CombineLatestOperatorDrawer,
	ConcatOperatorDrawer,
	ForkJoinOperatorDrawer,
	MergeOperatorDrawer,
	RaceOperatorDrawer,
	ZipOperatorDrawer,
} from './joinCreationOperators';
import { useElementDrawerHandlers } from './state';
import { ElementDrawerProps } from './ElementDrawerProps';
import { animationRegistry } from '../animation';
import {
	BufferCountOperatorDrawer,
	BufferOperatorDrawer,
	BufferTimeOperatorDrawer,
	BufferToggleOperatorDrawer,
	BufferWhenOperatorDrawer,
	ConcatMapOperatorDrawer,
	ExhaustMapOperatorDrawer,
	ExpandOperatorDrawer,
	MapOperatorDrawer,
	MergeMapOperatorDrawer,
} from './transformationOperators';
import { isSelectedElement } from '../store/elements';
import { selectElementErrorById } from '../store/errors';
import { StageState, isHighlighted, selectStageState } from '../store/stage';
import { useStore } from '../store/rootState';
import { selectDrawerAnimationByDrawerId } from '../store/drawerAnimations';
import { selectElementSizeOptions, useThemeContext } from '../store/hooks';

export const createOperatorDrawer = (elType: ElementType, props: ElementDrawerProps) => {
	switch (elType) {
		// creationOperators
		case ElementType.Interval:
			return <IntervalOperatorDrawer {...props} />;
		case ElementType.Of:
			return <OfOperatorDrawer {...props} />;
		case ElementType.From:
			return <FromOperatorDrawer {...props} />;
		case ElementType.IIf:
			return <IifOperatorDrawer {...props} />;
		case ElementType.Ajax:
			return <AjaxOperatorDrawer {...props} />;
		case ElementType.Empty:
			return <EmptyOperatorDrawer {...props} />;
		case ElementType.Defer:
			return <DeferOperatorDrawer {...props} />;
		case ElementType.Generate:
			return <GenerateOperatorDrawer {...props} />;
		case ElementType.Range:
			return <RangeOperatorDrawer {...props} />;
		case ElementType.ThrowError:
			return <ThrowErrorOperatorDrawer {...props} />;
		case ElementType.Timer:
			return <TimerOperatorDrawer {...props} />;
		// join creation operators
		case ElementType.Merge:
			return <MergeOperatorDrawer {...props} />;
		case ElementType.CombineLatest:
			return <CombineLatestOperatorDrawer {...props} />;
		case ElementType.Concat:
			return <ConcatOperatorDrawer {...props} />;
		case ElementType.ForkJoin:
			return <ForkJoinOperatorDrawer {...props} />;
		case ElementType.Race:
			return <RaceOperatorDrawer {...props} />;
		case ElementType.Zip:
			return <ZipOperatorDrawer {...props} />;
		// transformation operators
		case ElementType.Buffer:
			return <BufferOperatorDrawer {...props} />;
		case ElementType.BufferCount:
			return <BufferCountOperatorDrawer {...props} />;
		case ElementType.BufferTime:
			return <BufferTimeOperatorDrawer {...props} />;
		case ElementType.BufferToggle:
			return <BufferToggleOperatorDrawer {...props} />;
		case ElementType.BufferWhen:
			return <BufferWhenOperatorDrawer {...props} />;
		case ElementType.ExhaustMap:
			return <ExhaustMapOperatorDrawer {...props} />;
		case ElementType.Expand:
			return <ExpandOperatorDrawer {...props} />;
		case ElementType.Map:
			return <MapOperatorDrawer {...props} />;
		case ElementType.ConcatMap:
			return <ConcatMapOperatorDrawer {...props} />;
		case ElementType.MergeMap:
			return <MergeMapOperatorDrawer {...props} />;
		// other
		case ElementType.Filter:
			return <FilterOperatorDrawer {...props} />;
		case ElementType.CatchError:
			return <CatchErrorOperatorDrawer {...props} />;
		case ElementType.Subscriber:
			return <SubscriberDrawer {...props} />;
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
	const animation = useStore(selectDrawerAnimationByDrawerId(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const select = useStore(isSelectedElement(element.id));
	const highlight = useStore(isHighlighted(element.id));
	const error = useStore(selectElementErrorById(element.id));
	const elementSizeOptions = useStore(selectElementSizeOptions);
	const stageState = useStore(selectStageState());

	const animationConfig = animation
		? {
				...animationRegistry.retrieveAnimationConfig(animation.key)(theme, animation.data),
				id: animation.id,
				dispose: animation.dispose,
		  }
		: null;

	switch (element.type) {
		case ElementType.Result:
			return (
				<ResultDrawer
					{...drawerHandlers}
					id={element.id}
					x={element.x}
					y={element.y}
					scale={elementSizeOptions.scale}
					visible={element.visible}
					properties={element.properties}
					animation={animationConfig}
					theme={theme}
					select={select}
					highlight={highlight}
					draggable={draggable}
					hash={(element as ResultElement).properties.hash}
				/>
			);
		default:
			return createOperatorDrawer(element.type, {
				...drawerHandlers,
				id: element.id,
				x: element.x,
				y: element.y,
				scale: elementSizeOptions.scale,
				visible: element.visible,
				properties: element.properties,
				animation: animationConfig,
				theme,
				select,
				highlight,
				draggable,
				draggableSnap: stageState === StageState.SnapDragging,
				visibleConnectPoints,
				hasError: Boolean(error),
			});
	}
};
