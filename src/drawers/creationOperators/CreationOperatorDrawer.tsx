import { useEffect, useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Text } from 'react-konva';
import { DrawerAnimations, DrawerProps } from '../DrawerProps';
import { Animation } from '../../animation';
import { ConnectPointsDrawer } from '../connectPoints';
import { useHighlightDrawerAnimation } from '../animation';
import { useElementDrawerTheme, useSizes } from '../../theme';

export interface CreationOperatorDrawerProps extends DrawerProps {
	title: string;
}

export const CreationOperatorDrawer = ({
	x,
	y,
	title,
	size,
	highlight,
	select,
	id,
	theme,
	visibleConnectionPoints,
	highlightedConnectPoints,
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationDestroy,
	onAnimationReady,
	onConnectPointMouseDown,
	onConnectPointMouseOut,
	onConnectPointMouseOver,
	onConnectPointMouseUp,
}: CreationOperatorDrawerProps) => {
	const drawerStyle = useElementDrawerTheme(
		{
			highlight,
			select,
		},
		theme,
	);
	const { drawerSizes, fontSizes } = useSizes(theme, size);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const [mainTextRef, setMainTextRef] = useState<Konva.Text | null>(null);

	const highlightAnimation = useHighlightDrawerAnimation(mainShapeRef, mainTextRef, theme);

	// const iconFontSize = fromSize(DRAWER_DEFAULT.iconFontSize, size);
	// const iconX = radius + -1 * radius * Math.sin(-45) - (iconTextRef?.textWidth ?? 0) / 2;
	// const iconY = radius + radius * Math.cos(-45) - (iconTextRef?.textHeight ?? 0) / 2;

	const textX = drawerSizes.radius + (mainTextRef?.textWidth ?? 0) / -2;
	const textY = drawerSizes.radius + (mainTextRef?.textHeight ?? 0) / -2;

	const createAnimation = (): DrawerAnimations => ({
		highlight: highlightAnimation,
	});

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOver?.({
			id,
			originalEvent: e,
			animations: createAnimation(),
		});

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOut?.({
			id,
			originalEvent: e,
			animations: createAnimation(),
		});

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDown?.({
			id,
			originalEvent: e,
			animations: createAnimation(),
		});

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragMove?.({
			id,
			originalEvent: e,
			animations: createAnimation(),
		});

	const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragStart?.({
			id,
			originalEvent: e,
			animations: createAnimation(),
		});

	const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragEnd?.({
			id,
			originalEvent: e,
			animations: createAnimation(),
		});

	useEffect(() => {
		if (!highlightAnimation) {
			return;
		}

		const animations: DrawerAnimations = createAnimation();
		onAnimationReady?.({
			id,
			animations,
		});

		return () => {
			Object.values(animations).forEach((a: Animation) => a.destroy());
			onAnimationDestroy?.({
				id,
			});
		};
	}, [highlightAnimation]);

	return (
		<Group visible={Boolean(mainTextRef && mainShapeRef)}>
			{visibleConnectionPoints ? (
				<ConnectPointsDrawer
					id={id}
					x={x + drawerSizes.radius / 2}
					y={y + drawerSizes.radius / 2}
					width={drawerSizes.radius}
					height={drawerSizes.radius}
					theme={theme}
					offset={32}
					onMouseDown={onConnectPointMouseDown}
					onMouseUp={onConnectPointMouseUp}
					onMouseOut={onConnectPointMouseOut}
					onMouseOver={onConnectPointMouseOver}
					highlightConnectPoints={highlightedConnectPoints}
				/>
			) : null}

			<Group
				draggable
				x={x}
				y={y}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				onMouseDown={handleMouseDown}
				onDragMove={handleDragMove}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<Circle
					{...drawerStyle.element}
					ref={(ref) => setMainShapeRef(ref)}
					id={id}
					radius={drawerSizes.radius}
					x={drawerSizes.radius}
					y={drawerSizes.radius}
				/>
				<Text
					{...drawerStyle.text}
					ref={(ref) => setMainTextRef(ref)}
					text={title}
					x={textX}
					y={textY}
					fontSize={fontSizes.primary}
					listening={false}
				/>
			</Group>
		</Group>
	);
};

