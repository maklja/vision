import { ReactNode } from 'react';
import Konva from 'konva';
import { useState } from 'react';
import { Circle, Group } from 'react-konva';
import { DrawerAnimationTemplate, useAnimation } from '../../animation';
import { ConnectPointPosition, ConnectPointType } from '../../model';
import { Theme, useConnectPointTheme, useSizes } from '../../theme';
import { DrawerAnimationEvents } from '../DrawerProps';
import { EventIconDrawer } from './EventIconDrawer';
import { InputIconDrawer } from './InputIconDrawer';
import { OutputIconDrawer } from './OutputIconDrawer';

export interface ConnectPointIconDrawerProps {
	connectPointPosition: ConnectPointPosition;
	type: ConnectPointType;
	theme: Theme;
	highlight?: boolean;
}

const ConnectPointIconDrawer = ({
	connectPointPosition,
	type,
	theme,
	highlight,
}: ConnectPointIconDrawerProps) => {
	switch (type) {
		case ConnectPointType.Input:
			return (
				<InputIconDrawer
					connectPointPosition={connectPointPosition}
					theme={theme}
					highlight={highlight}
				/>
			);
		case ConnectPointType.Output:
			return (
				<OutputIconDrawer
					connectPointPosition={connectPointPosition}
					theme={theme}
					highlight={highlight}
				/>
			);
		case ConnectPointType.Event:
			return (
				<EventIconDrawer
					connectPointPosition={connectPointPosition}
					theme={theme}
					highlight={highlight}
				/>
			);
		default:
			return null;
	}
};

export interface ConnectPointDrawerEvent {
	id: string;
	type: ConnectPointType;
	position: ConnectPointPosition;
	x: number;
	y: number;
	originalEvent: Konva.KonvaEventObject<MouseEvent>;
	animation?: DrawerAnimationTemplate | null;
}

export interface ConnectPointDrawerProps extends DrawerAnimationEvents {
	id: string;
	type: ConnectPointType;
	position: ConnectPointPosition;
	x: number;
	y: number;
	theme: Theme;
	highlight?: boolean;
	animation?: DrawerAnimationTemplate | null;
	onMouseDown?: (event: ConnectPointDrawerEvent) => void;
	onMouseUp?: (event: ConnectPointDrawerEvent) => void;
	onMouseOver?: (event: ConnectPointDrawerEvent) => void;
	onMouseOut?: (event: ConnectPointDrawerEvent) => void;
	createIcon?: (props: ConnectPointIconDrawerProps) => ReactNode;
}

export const ConnectPointDrawer = ({
	id,
	type,
	position,
	x,
	y,
	highlight,
	animation,
	theme,
	createIcon,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: ConnectPointDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme({ position, highlight }, theme);
	const { connectPointSizes } = useSizes(theme);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);

	useAnimation(mainShapeRef, {
		animationTemplate: animation,
		mapper: (a) => ({
			config: a.mainShape,
		}),
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		drawerId: id,
	});

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOver?.({ id, type, position, x, y, animation, originalEvent: e });
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOut?.({ id, type, position, x, y, animation, originalEvent: e });
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseDown?.({ id, type, position, x, y, animation, originalEvent: e });
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseUp?.({ id, type, position, x, y, animation, originalEvent: e });
	};

	return (
		<Group x={x} y={y} visible={Boolean(mainShapeRef)}>
			<Circle
				{...connectPointElementTheme.element}
				radius={connectPointSizes.radius}
				ref={(node) => setMainShapeRef(node)}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
			/>

			{createIcon?.({ type, theme, highlight, connectPointPosition: position }) ?? (
				<ConnectPointIconDrawer
					type={type}
					theme={theme}
					highlight={highlight}
					connectPointPosition={position}
				/>
			)}
		</Group>
	);
};

