import { OfOperatorDrawer, FromOperatorDrawer, SubscriberDrawer } from '../drawers';
import { Element, ElementType } from '../model';
import { elementConnector } from '../store/connector';
import { Drawer } from './Drawer';

const createFromElement = (el: Element) => (
	<Drawer element={el}>
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

const createOfElement = (el: Element) => (
	<Drawer element={el}>
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

const createSubscriberElement = (el: Element) => (
	<Drawer element={el}>
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
	[ElementType.Of, createOfElement],
	[ElementType.From, createFromElement],
	[ElementType.Subscriber, createSubscriberElement],
]);

export const createDrawerElement = (el: Element): JSX.Element | null => {
	const elementFactory = elementFactories.get(el.type);
	return elementFactory?.(el) ?? null;
};

