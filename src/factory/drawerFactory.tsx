import { elementConnector, connectPointsConnector } from '../store/connector';
import {
	OfOperatorDrawer,
	FromOperatorDrawer,
	ConnectPointsDrawer,
	// ConnectedSubscriberElement,
	BorderDrawer,
} from '../drawers';
import { ConnectPointType, Element, ElementType } from '../model';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store/rootState';
import { highlightDrawers, selectDrawers, StageState } from '../store/stageSlice';
import Konva from 'konva';
import { drawerMapDispatch } from '../store/connector/elementConnector';
import { DRAWER_DEFAULT, fromSize } from '../drawers/utils';
import { connectPointsMapDispatch } from '../store/connector/connectPointsConnector';
import { Group } from 'react-konva';
import {
	selectedBorderTheme,
	highlightBorderTheme,
	connectPointTheme,
	highlightConnectPointTheme,
} from '../theme';
import { snapConnectPointAnimation } from '../animations';

const ConnectedOfOperatorDrawer = elementConnector(OfOperatorDrawer);
const ConnectedFromOperatorDrawer = elementConnector(FromOperatorDrawer);
// const ConnectedConnectPointsDrawer = connectPointsConnector(ConnectPointsDrawer);

// const createOfElement = (el: Element) => (
// 	<ConnectedConnectPointsDrawer
// 		id={el.id}
// 		absoluteX={el.x}
// 		absoluteY={el.y}
// 		x={el.x - 24}
// 		y={el.y - 24}
// 		width={48}
// 		height={48}
// 	>
// 		<ConnectedOfOperatorDrawer
// 			id={el.id}
// 			key={el.id}
// 			// onCreateConnectPoints={(connectPointProps) => (
// 			// 	<ConnectedConnectPointsDrawer
// 			// 		{...connectPointProps}
// 			// 		absoluteX={el.x}
// 			// 		absoluteY={el.y}
// 			// 	/>
// 			// )}
// 		/>
// 	</ConnectedConnectPointsDrawer>
// );

const createFromElement = (el: Element) => <ConnectedFromOperatorDrawer id={el.id} key={el.id} />;

const createSubscriberElement = (el: Element) => null;
// <ConnectedSubscriberElement id={el.id} key={el.id} />

const elementFactories = new Map<ElementType, (el: Element) => JSX.Element | null>([
	// [ElementType.Of, createOfElement],
	[ElementType.From, createFromElement],
	[ElementType.Subscriber, createSubscriberElement],
]);

export const createDrawerElement = (el: Element) => {
	const elementFactory = elementFactories.get(el.type);
	// return elementFactory ? elementFactory(el) : null;
	return <CreationOperation el={el} />;
};

export const CreationOperation = ({ el }: { el: Element }) => {
	const appDispatch = useAppDispatch();
	const stageState = useAppSelector((root) => root.stage);
	const connectPointsState = useAppSelector((root) => root.connectPoints);
	const selected = stageState.selected.some((elementId) => elementId === el.id);
	const highlighted = stageState.highlighted.some((elementId) => elementId === el.id);
	const dragging = stageState.state === StageState.Dragging;
	const draftConnectLine = stageState.connectLines.find(
		(cl) => cl.id === stageState.draftConnectLineId,
	);
	const drawConnectLine = stageState.state === StageState.DrawConnectLine;
	const snap = drawConnectLine && draftConnectLine?.locked;

	const highlightedConnectPoints = connectPointsState.highlighted
		.filter((cp) => cp.elementId === el.id)
		.map((cp) => cp.type);

	const width = fromSize(DRAWER_DEFAULT.width);
	const height = fromSize(DRAWER_DEFAULT.height);
	const borderStyle = {
		...(highlighted ? highlightBorderTheme : {}),
		...(selected ? selectedBorderTheme : {}),
	};
	return (
		<Group>
			{selected && !dragging ? (
				<ConnectPointsDrawer
					{...connectPointsMapDispatch(appDispatch, el)}
					id={el.id}
					x={el.x - width / 2}
					y={el.y - height / 2}
					width={width}
					height={height}
					animations={{
						[ConnectPointType.Top]:
							snap && highlightedConnectPoints.includes(ConnectPointType.Top)
								? snapConnectPointAnimation
								: undefined,
					}}
					styles={{
						[ConnectPointType.Top]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Top)
								? highlightConnectPointTheme
								: {}),
						},
						[ConnectPointType.Bottom]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Bottom)
								? highlightConnectPointTheme
								: {}),
						},
						[ConnectPointType.Left]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Left)
								? highlightConnectPointTheme
								: {}),
						},
						[ConnectPointType.Right]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Right)
								? highlightConnectPointTheme
								: {}),
						},
					}}
				/>
			) : null}

			{selected || highlighted ? (
				<BorderDrawer
					x={el.x - width / 2}
					y={el.y - height / 2}
					width={width}
					height={height}
					padding={1}
					style={borderStyle}
				/>
			) : null}

			<OfOperatorDrawer {...drawerMapDispatch(appDispatch)} id={el.id} x={el.x} y={el.y} />
		</Group>
	);
};

