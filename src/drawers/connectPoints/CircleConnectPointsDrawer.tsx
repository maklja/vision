import { Group, Line } from 'react-konva';
import { ConnectPointPosition, BoundingBox, ElementType } from '../../model';
import { CircleShapeSize, Theme } from '../../theme';
import {
	ConnectPointDrawerEvent,
	ConnectPointsDrawerEvents,
	ConnectPointsOptions,
} from '../DrawerProps';
import { CircleConnectPointDrawer } from './CircleConnectPointDrawer';
import { useBoundingBox } from '../../store/stageSlice';

export interface CircleConnectPointsDrawerProps extends ConnectPointsDrawerEvents {
	id: string;
	theme: Theme;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	offset?: number;
	connectPointsOptions: ConnectPointsOptions<CircleShapeSize>;
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
	const connectPointBB = useBoundingBox(ElementType.ConnectPoint, { x: 0, y: 0 });
	const connectPointHalfWidth = connectPointBB.width / 2;
	const connectPointHalfHeight = connectPointBB.height / 2;

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
			{connectPointsOptions.top?.visible && (
				<Line
					{...theme.connectLine.line}
					points={[
						connectPointsOptions.top.x + connectPointHalfWidth,
						connectPointsOptions.top.y + connectPointHalfHeight - offset,
						centerX,
						centerY,
					]}
					perfectDrawEnabled={false}
				/>
			)}
			{connectPointsOptions.top?.visible && (
				<CircleConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Top)}
					type={connectPointsOptions.top.type}
					position={ConnectPointPosition.Top}
					x={connectPointsOptions.top.x}
					y={connectPointsOptions.top.y - offset}
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
					highlight={connectPointsOptions.top.highlight}
					animation={connectPointsOptions.top.animation}
				>
					{connectPointsOptions.top.icon}
				</CircleConnectPointDrawer>
			)}

			{connectPointsOptions.right?.visible && (
				<Line
					{...theme.connectLine.line}
					points={[
						connectPointsOptions.right.x + connectPointHalfWidth + offset,
						connectPointsOptions.right.y + connectPointHalfHeight,
						centerX,
						centerY,
					]}
					perfectDrawEnabled={false}
				/>
			)}

			{connectPointsOptions.right?.visible && (
				<CircleConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Right)}
					type={connectPointsOptions.right.type}
					position={ConnectPointPosition.Right}
					x={connectPointsOptions.right.x + offset}
					y={connectPointsOptions.right.y}
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
					highlight={connectPointsOptions.right.highlight}
					animation={connectPointsOptions.right.animation}
				>
					{connectPointsOptions.right.icon}
				</CircleConnectPointDrawer>
			)}

			{connectPointsOptions.bottom?.visible && (
				<Line
					{...theme.connectLine.line}
					points={[
						connectPointsOptions.bottom.x + connectPointHalfWidth,
						connectPointsOptions.bottom.y + connectPointHalfHeight + offset,
						centerX,
						centerY,
					]}
					perfectDrawEnabled={false}
				/>
			)}

			{connectPointsOptions.bottom?.visible && (
				<CircleConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Bottom)}
					type={connectPointsOptions.bottom.type}
					position={ConnectPointPosition.Bottom}
					x={connectPointsOptions.bottom.x}
					y={connectPointsOptions.bottom.y + offset}
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
					highlight={connectPointsOptions.bottom.highlight}
					animation={connectPointsOptions.bottom.animation}
				>
					{connectPointsOptions.bottom.icon}
				</CircleConnectPointDrawer>
			)}

			{connectPointsOptions.left?.visible && (
				<Line
					{...theme.connectLine.line}
					points={[
						connectPointsOptions.left.x + connectPointHalfWidth - offset,
						connectPointsOptions.left.y + connectPointHalfHeight,
						centerX,
						centerY,
					]}
					perfectDrawEnabled={false}
				/>
			)}

			{connectPointsOptions.left?.visible && (
				<CircleConnectPointDrawer
					id={createConnectPointDrawerId(id, ConnectPointPosition.Left)}
					type={connectPointsOptions.left.type}
					position={ConnectPointPosition.Left}
					x={connectPointsOptions.left.x - offset}
					y={connectPointsOptions.left.y}
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
					highlight={connectPointsOptions.left.highlight}
					animation={connectPointsOptions.left.animation}
				>
					{connectPointsOptions.left.icon}
				</CircleConnectPointDrawer>
			)}
		</Group>
	);
};

