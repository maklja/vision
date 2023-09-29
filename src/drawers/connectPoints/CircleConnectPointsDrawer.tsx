import { Group, Line } from 'react-konva';
import { ConnectPointPosition, BoundingBox, ConnectPoints } from '../../model';
import { CircleShapeSize, Theme } from '../../theme';
import {
	ConnectPointDrawerEvent,
	ConnectPointsDrawerEvents,
	ConnectPointsOptions,
} from '../DrawerProps';
import { CircleConnectPointDrawer } from './CircleConnectPointDrawer';

export interface CircleConnectPointsDrawerProps extends ConnectPointsDrawerEvents {
	id: string;
	theme: Theme;
	connectPoints: ConnectPoints;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	offset?: number;
	connectPointsOptions?: ConnectPointsOptions<CircleShapeSize>;
	highlightedConnectPoints?: ConnectPointPosition[];
}

export const createConnectPointDrawerId = (
	drawerId: string,
	connectPointPosition: ConnectPointPosition,
) => `${drawerId}_${connectPointPosition}`;

export const CircleConnectPointsDrawer = ({
	id,
	x = 0,
	y = 0,
	width = 0,
	height = 0,
	offset = 0,
	theme,
	connectPoints,
	connectPointsOptions,
	highlightedConnectPoints,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
	onMouseMove,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: CircleConnectPointsDrawerProps) => {
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

	const handleOnMouseMove = (cEvent: ConnectPointDrawerEvent) => {
		onMouseMove?.({
			id,
			connectPoint: cEvent,
			element: new BoundingBox(x, y, width, height),
		});
	};

	return (
		<Group>
			{connectPoints.top?.visible && (
				<Line
					{...theme.connectLine.line}
					points={[connectPoints.top.x, connectPoints.top.y, centerX, centerY]}
					perfectDrawEnabled={false}
				/>
			)}
			{connectPointsOptions && connectPoints.top?.visible && (
				<CircleConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Top)}
					type={connectPoints.top.type}
					position={ConnectPointPosition.Top}
					x={connectPoints.top.x}
					y={connectPoints.top.y}
					theme={theme}
					size={connectPointsOptions.top.shapeSize}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onMouseMove={handleOnMouseMove}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Top)}
					animation={connectPointsOptions.top.animation}
				>
					{connectPointsOptions.top.icon}
				</CircleConnectPointDrawer>
			)}

			{connectPointsOptions?.right.visible && (
				<Line
					{...theme.connectLine.line}
					points={[rightX, rightY, centerX, centerY]}
					perfectDrawEnabled={false}
				/>
			)}

			{connectPointsOptions?.right.visible && (
				<CircleConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Right)}
					type={connectPointsOptions.right.type}
					position={ConnectPointPosition.Right}
					x={rightX - connectPointsOptions.right.shapeSize.radius}
					y={rightY - connectPointsOptions.right.shapeSize.radius}
					theme={theme}
					size={connectPointsOptions.right.shapeSize}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onMouseMove={handleOnMouseMove}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Right)}
					animation={connectPointsOptions.right.animation}
				>
					{connectPointsOptions.right.icon}
				</CircleConnectPointDrawer>
			)}

			{connectPointsOptions?.bottom.visible && (
				<Line
					{...theme.connectLine.line}
					points={[bottomX, bottomY, centerX, centerY]}
					perfectDrawEnabled={false}
				/>
			)}

			{connectPointsOptions?.bottom.visible && (
				<CircleConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Bottom)}
					type={connectPointsOptions.bottom.type}
					position={ConnectPointPosition.Bottom}
					x={bottomX - connectPointsOptions.bottom.shapeSize.radius}
					y={bottomY - connectPointsOptions.bottom.shapeSize.radius}
					theme={theme}
					size={connectPointsOptions.bottom.shapeSize}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onMouseMove={handleOnMouseMove}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Bottom)}
					animation={connectPointsOptions.bottom.animation}
				>
					{connectPointsOptions.bottom.icon}
				</CircleConnectPointDrawer>
			)}

			{connectPointsOptions?.left.visible && (
				<Line
					{...theme.connectLine.line}
					points={[leftX, leftY, centerX, centerY]}
					perfectDrawEnabled={false}
				/>
			)}

			{connectPointsOptions?.left.visible && (
				<CircleConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Left)}
					type={connectPointsOptions.left.type}
					position={ConnectPointPosition.Left}
					x={leftX - connectPointsOptions.left.shapeSize.radius}
					y={leftY - connectPointsOptions.left.shapeSize.radius}
					theme={theme}
					size={connectPointsOptions.left.shapeSize}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onMouseMove={handleOnMouseMove}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Left)}
					animation={connectPointsOptions.left.animation}
				>
					{connectPointsOptions.left.icon}
				</CircleConnectPointDrawer>
			)}
		</Group>
	);
};

