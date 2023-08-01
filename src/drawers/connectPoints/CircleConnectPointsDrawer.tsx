import { Group, Line } from 'react-konva';
import { ConnectPointPosition, BoundingBox } from '../../model';
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
	connectPointsOptions,
	highlightedConnectPoints,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
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

	return (
		<Group>
			{connectPointsOptions?.top.visible && (
				<Line
					{...theme.connectLine.line}
					points={[topX, topY, centerX, centerY]}
					perfectDrawEnabled={false}
				/>
			)}
			{connectPointsOptions?.top.visible && (
				<CircleConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Top)}
					type={connectPointsOptions?.top.type}
					position={ConnectPointPosition.Top}
					x={topX}
					y={topY}
					theme={theme}
					size={connectPointsOptions?.top.shapeSize}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Top)}
					animation={connectPointsOptions?.top.animation}
				>
					{connectPointsOptions?.top.icon}
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
					x={rightX}
					y={rightY}
					theme={theme}
					size={connectPointsOptions?.right.shapeSize}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Right)}
					animation={connectPointsOptions?.right.animation}
				>
					{connectPointsOptions?.right.icon}
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
					x={bottomX}
					y={bottomY}
					theme={theme}
					size={connectPointsOptions?.bottom.shapeSize}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Bottom)}
					animation={connectPointsOptions?.bottom.animation}
				>
					{connectPointsOptions?.bottom.icon}
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
					x={leftX}
					y={leftY}
					theme={theme}
					size={connectPointsOptions?.left.shapeSize}
					onMouseDown={handleOnMouseDown}
					onMouseUp={handleOnMouseUp}
					onMouseOver={handleOnMouseOver}
					onMouseOut={handleOnMouseOut}
					onAnimationBegin={onAnimationBegin}
					onAnimationComplete={onAnimationComplete}
					onAnimationDestroy={onAnimationDestroy}
					highlight={highlightedConnectPoints?.includes(ConnectPointPosition.Left)}
					animation={connectPointsOptions?.left.animation}
				>
					{connectPointsOptions?.left.icon}
				</CircleConnectPointDrawer>
			)}
		</Group>
	);
};
