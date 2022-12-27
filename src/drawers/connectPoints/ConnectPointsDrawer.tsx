import { Group } from 'react-konva';
import { TweenAnimationInstanceConfig } from '../../animation';
import { ConnectPointType } from '../../model';
import { ThemeContext } from '../../theme';
import { DrawerAnimationEvents } from '../DrawerProps';
import { BoundingBox } from '../utils';
import { ConnectPointDrawer, ConnectPointDrawerEvent } from './ConnectPointDrawer';

export type ConnectPointAnimations = {
	[key in ConnectPointType]?: TweenAnimationInstanceConfig | null;
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
	x: number;
	y: number;
	theme: ThemeContext;
	width?: number;
	height?: number;
	offset?: number;
	connectPointAnimations?: ConnectPointAnimations;
	highlightedConnectPoints?: ConnectPointType[];
}

export const createConnectPointDrawerId = (drawerId: string, connectPointType: ConnectPointType) =>
	`${drawerId}_${connectPointType}`;

export const ConnectPointsDrawer = ({
	id,
	x,
	y,
	width = 0,
	height = 0,
	offset = 0,
	theme,
	connectPointAnimations,
	highlightedConnectPoints,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: ConnectPointsDrawerProps) => {
	const topX = x + width / 2;
	const topY = y - offset;

	const rightX = x + width + offset;
	const rightY = y + height / 2;

	const bottomX = x + width / 2;
	const bottomY = y + height + offset;

	const leftX = x - offset;
	const leftY = y + height / 2;

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
		</Group>
	);
};
