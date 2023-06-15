import { Group, Line } from 'react-konva';
import { DrawerAnimationTemplate } from '../../animation';
import { ConnectPointType } from '../../model';
import { ThemeContext } from '../../theme';
import { DrawerAnimationEvents } from '../DrawerProps';
import { BoundingBox } from '../utils';
import { ConnectPointDrawer, ConnectPointDrawerEvent } from './ConnectPointDrawer';

export type ConnectPointAnimations = {
	[key in ConnectPointType]?: DrawerAnimationTemplate | null;
};

export type ConnectPointVisibility = {
	[key in ConnectPointType]?: boolean;
};

export interface ConnectPointsDrawerEvent {
	id: string;
	connectPoint: ConnectPointDrawerEvent;
	element: BoundingBox;
}

export interface ConnectPointsDrawerEvents extends DrawerAnimationEvents {
	onMouseDown?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseUp?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseOver?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseOut?: (cEvent: ConnectPointsDrawerEvent) => void;
}

export interface ConnectPointsDrawerProps extends ConnectPointsDrawerEvents {
	id: string;
	theme: ThemeContext;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	offset?: number;
	connectPointAnimations?: ConnectPointAnimations;
	highlightedConnectPoints?: ConnectPointType[];
	visibleConnectPoints?: ConnectPointVisibility;
}

export const createConnectPointDrawerId = (drawerId: string, connectPointType: ConnectPointType) =>
	`${drawerId}_${connectPointType}`;

export const ConnectPointsDrawer = ({
	id,
	x = 0,
	y = 0,
	width = 0,
	height = 0,
	offset = 0,
	theme,
	connectPointAnimations,
	highlightedConnectPoints,
	visibleConnectPoints = {},
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: ConnectPointsDrawerProps) => {
	const centerX = x + width / 2;
	const centerY = y + height / 2;

	const topX = centerX;
	const topY = y - offset;

	const rightX = x + width + offset;
	const rightY = centerY;

	const bottomX = centerX;
	const bottomY = y + height + offset;

	const leftX = x - offset;
	const leftY = centerY;

	const handleOnMouseDown = (cEvent: ConnectPointDrawerEvent) => {
		onMouseDown?.({
			id,
			connectPoint: cEvent,
			element: new BoundingBox(x, y, width, height),
		});
	};

	const handleOnMouseUp = (cEvent: ConnectPointDrawerEvent) => {
		onMouseUp?.({
			id,
			connectPoint: cEvent,
			element: new BoundingBox(x, y, width, height),
		});
	};

	const handleOnMouseOver = (cEvent: ConnectPointDrawerEvent) => {
		onMouseOver?.({
			id,
			connectPoint: cEvent,
			element: new BoundingBox(x, y, width, height),
		});
	};

	const handleOnMouseOut = (cEvent: ConnectPointDrawerEvent) => {
		onMouseOut?.({
			id,
			connectPoint: cEvent,
			element: new BoundingBox(x, y, width, height),
		});
	};

	const { top = true, left = true, bottom = true, right = true } = visibleConnectPoints;
	return (
		<Group>
			{top && (
				<Line
					{...theme.connectLine.line}
					points={[topX, topY, centerX, centerY]}
					perfectDrawEnabled={false}
				></Line>
			)}
			{top && (
				<ConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointType.Top)}
					type={ConnectPointType.Top}
					x={topX}
					y={topY}
					theme={theme}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointType.Top)}
					animation={connectPointAnimations?.[ConnectPointType.Top]}
				/>
			)}

			{right && (
				<Line
					{...theme.connectLine.line}
					points={[rightX, rightY, centerX, centerY]}
					perfectDrawEnabled={false}
				></Line>
			)}

			{right && (
				<ConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointType.Right)}
					type={ConnectPointType.Right}
					x={rightX}
					y={rightY}
					theme={theme}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointType.Right)}
					animation={connectPointAnimations?.[ConnectPointType.Right]}
				/>
			)}

			{bottom && (
				<Line
					{...theme.connectLine.line}
					points={[bottomX, bottomY, centerX, centerY]}
					perfectDrawEnabled={false}
				></Line>
			)}

			{bottom && (
				<ConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointType.Bottom)}
					type={ConnectPointType.Bottom}
					x={bottomX}
					y={bottomY}
					theme={theme}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointType.Bottom)}
					animation={connectPointAnimations?.[ConnectPointType.Bottom]}
				/>
			)}

			{left && (
				<Line
					{...theme.connectLine.line}
					points={[leftX, leftY, centerX, centerY]}
					perfectDrawEnabled={false}
				></Line>
			)}

			{left && (
				<ConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointType.Left)}
					type={ConnectPointType.Left}
					x={leftX}
					y={leftY}
					theme={theme}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointType.Left)}
					animation={connectPointAnimations?.[ConnectPointType.Left]}
				/>
			)}
		</Group>
	);
};

