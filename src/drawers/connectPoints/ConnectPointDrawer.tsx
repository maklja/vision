import Konva from 'konva';
import { useState } from 'react';
import { Circle, Group } from 'react-konva';
import { DrawerAnimationTemplate, useAnimation } from '../../animation';
import { ConnectPointType } from '../../model';
import { ThemeContext, useConnectPointTheme, useSizes } from '../../theme';
import { DrawerAnimationEvents } from '../DrawerProps';
import { EventIconDrawer } from './EventIconDrawer';
import { InputIconDrawer } from './InputIconDrawer';
import { OutputIconDrawer } from './OutputIconDrawer';

export interface ConnectPointDrawerEvent {
	id: string;
	type: ConnectPointType;
	x: number;
	y: number;
	originalEvent: Konva.KonvaEventObject<MouseEvent>;
	animation?: DrawerAnimationTemplate | null;
}

export interface ConnectPointDrawerProps extends DrawerAnimationEvents {
	id: string;
	type: ConnectPointType;
	x: number;
	y: number;
	theme: ThemeContext;
	highlight?: boolean;
	animation?: DrawerAnimationTemplate | null;
	onMouseDown?: (event: ConnectPointDrawerEvent) => void;
	onMouseUp?: (event: ConnectPointDrawerEvent) => void;
	onMouseOver?: (event: ConnectPointDrawerEvent) => void;
	onMouseOut?: (event: ConnectPointDrawerEvent) => void;
}

export const ConnectPointDrawer = ({
	id,
	type,
	x,
	y,
	highlight,
	animation,
	theme,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: ConnectPointDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme({ highlight }, theme);
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
		onMouseOver?.({ id, type, x, y, animation, originalEvent: e });
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOut?.({ id, type, x, y, animation, originalEvent: e });
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseDown?.({ id, type, x, y, animation, originalEvent: e });
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseUp?.({ id, type, x, y, animation, originalEvent: e });
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
			<InputIconDrawer theme={theme} highlight={highlight} />
			{/* <EventIconDrawer theme={theme} highlight={highlight} /> */}
			{/* <OutputIconDrawer theme={theme} highlight={highlight} /> */}
		</Group>
	);
};

