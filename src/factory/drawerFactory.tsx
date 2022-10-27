import {
	OfOperatorDrawer,
	FromOperatorDrawer,
	SubscriberDrawer,
	FilterOperatorDrawer,
} from '../drawers';
import { rectSize } from '../drawers/utils';
import { Element, ElementType } from '../model';
import { elementConnector } from '../store/connector';
import { Drawer } from './Drawer';

const createFromDrawer = (el: Element) => {
	const { width, height } = rectSize(el.size);
	return (
		<Drawer element={el} x={el.x - width / 2} y={el.y - height / 2}>
			{(stageState, appDispatch) => (
				<FromOperatorDrawer
					{...elementConnector(stageState)(appDispatch)}
					id={el.id}
					x={el.x}
					y={el.y}
				/>
			)}
		</Drawer>
	);
};

const createOfDrawer = (el: Element) => {
	const { width, height } = rectSize(el.size);
	return (
		<Drawer element={el} x={el.x - width / 2} y={el.y - height / 2}>
			{(stageState, appDispatch) => (
				<OfOperatorDrawer
					{...elementConnector(stageState)(appDispatch)}
					id={el.id}
					x={el.x}
					y={el.y}
				/>
			)}
		</Drawer>
	);
};

const createFilterOperatorDrawer = (el: Element) => (
	<Drawer element={el}>
		{(stageState, appDispatch) => (
			<FilterOperatorDrawer
				{...elementConnector(stageState)(appDispatch)}
				id={el.id}
				x={el.x}
				y={el.y}
			/>
		)}
	</Drawer>
);

const createSubscriberDrawer = (el: Element) => {
	const { width, height } = rectSize(el.size);
	return (
		<Drawer element={el} x={el.x - width / 2} y={el.y - height / 2}>
			{(stageState, appDispatch) => (
				<SubscriberDrawer
					{...elementConnector(stageState)(appDispatch)}
					id={el.id}
					x={el.x}
					y={el.y}
				/>
			)}
		</Drawer>
	);
};

const elementFactories = new Map<ElementType, (el: Element) => JSX.Element | null>([
	[ElementType.Of, createOfDrawer],
	[ElementType.From, createFromDrawer],
	[ElementType.Filter, createFilterOperatorDrawer],
	[ElementType.Subscriber, createSubscriberDrawer],
]);

export const createDrawerElement = (el: Element): JSX.Element | null => {
	const elementFactory = elementFactories.get(el.type);
	return elementFactory?.(el) ?? null;
};
