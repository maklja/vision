import { Group, Line } from 'react-konva';
import { DrawerAnimationTemplate } from '../../animation';
import { ConnectPointPosition, ConnectPointType } from '../../model';
import { ThemeContext } from '../../theme';
import { DrawerAnimationEvents } from '../DrawerProps';
import { BoundingBox } from '../utils';
import { ConnectPointDrawer, ConnectPointDrawerEvent } from './ConnectPointDrawer';

export type ConnectPointAnimations = {
	[key in ConnectPointPosition]?: DrawerAnimationTemplate | null;
};

export type ConnectPointTypes = {
	[key in ConnectPointPosition]?: ConnectPointType | null;
};

export type ConnectPointVisibility = {
	[key in ConnectPointPosition]?: boolean;
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
	connectionPointTypes?: ConnectPointTypes;
	highlightedConnectPoints?: ConnectPointPosition[];
	visibleConnectPoints?: ConnectPointVisibility;
}

export const createConnectPointDrawerId = (
	drawerId: string,
	connectPointPosition: ConnectPointPosition,
) => `${drawerId}_${connectPointPosition}`;

export const ConnectPointsDrawer = ({
	id,
	x = 0,
	y = 0,
	width = 0,
	height = 0,
	offset = 0,
	theme,
	connectionPointTypes,
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
			{top && connectionPointTypes?.top && (
				<Line
					{...theme.connectLine.line}
					points={[topX, topY, centerX, centerY]}
					perfectDrawEnabled={false}
				></Line>
			)}
			{top && connectionPointTypes?.top && (
				<ConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Top)}
					type={connectionPointTypes?.top}
					position={ConnectPointPosition.Top}
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
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Top)}
					animation={connectPointAnimations?.[ConnectPointPosition.Top]}
				/>
			)}

			{right && connectionPointTypes?.right && (
				<Line
					{...theme.connectLine.line}
					points={[rightX, rightY, centerX, centerY]}
					perfectDrawEnabled={false}
				></Line>
			)}

			{right && connectionPointTypes?.right && (
				<ConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Right)}
					type={connectionPointTypes.right}
					position={ConnectPointPosition.Right}
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
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Right)}
					animation={connectPointAnimations?.[ConnectPointPosition.Right]}
				/>
			)}

			{bottom && connectionPointTypes?.bottom && (
				<Line
					{...theme.connectLine.line}
					points={[bottomX, bottomY, centerX, centerY]}
					perfectDrawEnabled={false}
				></Line>
			)}

			{bottom && connectionPointTypes?.bottom && (
				<ConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Bottom)}
					type={connectionPointTypes.bottom}
					position={ConnectPointPosition.Bottom}
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
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Bottom)}
					animation={connectPointAnimations?.[ConnectPointPosition.Bottom]}
				/>
			)}

			{left && connectionPointTypes?.left && (
				<Line
					{...theme.connectLine.line}
					points={[leftX, leftY, centerX, centerY]}
					perfectDrawEnabled={false}
				></Line>
			)}

			{left && connectionPointTypes?.left && (
				<ConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Left)}
					type={connectionPointTypes.left}
					position={ConnectPointPosition.Left}
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
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Left)}
					animation={connectPointAnimations?.[ConnectPointPosition.Left]}
				/>
			)}
		</Group>
	);
};

