import {
	OfOperatorDrawer,
	FromOperatorDrawer,
	SubscriberDrawer,
	FilterOperatorDrawer,
} from '../drawers';
import { Element, ElementType } from '../model';
import { elementConnector } from '../store/connector';
import { Drawer } from './Drawer';

const createFromDrawer = (el: Element) => (
	<Drawer key={el.id} element={el}>
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

const createOfDrawer = (el: Element) => (
	<Drawer key={el.id} element={el}>
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

const createFilterOperatorDrawer = (el: Element) => (
	<Drawer key={el.id} element={el}>
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

const createSubscriberDrawer = (el: Element) => (
	<Drawer key={el.id} element={el}>
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

