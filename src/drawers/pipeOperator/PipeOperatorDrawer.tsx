import Konva from 'konva';
import { useEffect, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Animation } from '../../animation';
import { ConnectPointsDrawer } from '../connectPoints';
import { DrawerAnimations, DrawerProps } from '../DrawerProps';
import { useErrorDrawerAnimation, useHighlightDrawerAnimation } from '../animation';
import { useElementDrawerTheme, useSizes } from '../../theme';

export interface PipeOperatorDrawer extends DrawerProps {
	title: string;
}

export const PipeOperatorDrawer = ({
	x,
	y,
	size,
	id,
	theme,
	highlight,
	select,
	title,
	visibleConnectionPoints,
	highlightedConnectPoints,
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationReady,
	onAnimationDestroy,
	onConnectPointMouseDown,
	onConnectPointMouseOut,
	onConnectPointMouseOver,
	onConnectPointMouseUp,
}: PipeOperatorDrawer) => {
	const drawerStyle = useElementDrawerTheme(
		{
			highlight,
			select,
		},
		theme,
	);
	const { drawerSizes, fontSizes } = useSizes(theme, size);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Rect | null>(null);
	const [mainTextRef, setMainTextRef] = useState<Konva.Text | null>(null);
	const highlightAnimation = useHighlightDrawerAnimation(mainShapeRef, mainTextRef, theme);
	const errorAnimation = useErrorDrawerAnimation(mainShapeRef, mainTextRef, theme);

	const createAnimation = (): DrawerAnimations => ({
		highlight: highlightAnimation,
		error: null,
	});

	console.log(`${id}_ `, highlightAnimation);
	useEffect(() => {
		if (!highlightAnimation) {
			return;
		}

		const animations: DrawerAnimations = createAnimation();
		onAnimationReady?.({
			id,
			animations,
		});

		animations.highlight?.play();
		return () => {
			Object.values(animations).forEach((a: Animation) => a.destroy());
			onAnimationDestroy?.({
				id,
			});
		};
	}, [highlightAnimation]);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOver?.({
			id,
			originalEvent: e,
		});

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOut?.({
			id,
			originalEvent: e,
		});

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDown?.({
			id,
			originalEvent: e,
		});

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragMove?.({
			id,
			originalEvent: e,
		});

	const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragStart?.({
			id,
			originalEvent: e,
		});

	const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragEnd?.({
			id,
			originalEvent: e,
		});

	const textX = (mainTextRef?.textWidth ?? 0) / -2 + drawerSizes.width / 2;
	const textY = (mainTextRef?.textHeight ?? 0) / -2 + drawerSizes.height / 2;

	return (
		<Group visible={Boolean(mainTextRef)}>
			{visibleConnectionPoints ? (
				<ConnectPointsDrawer
					id={id}
					x={x}
					y={y}
					theme={theme}
					width={drawerSizes.width}
					height={drawerSizes.height}
					offset={12}
					onMouseDown={onConnectPointMouseDown}
					onMouseUp={onConnectPointMouseUp}
					onMouseOut={onConnectPointMouseOut}
					onMouseOver={onConnectPointMouseOver}
					highlightConnectPoints={highlightedConnectPoints}
				/>
			) : null}

			<Group
				x={x}
				y={y}
				draggable
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				onMouseDown={handleMouseDown}
				onDragMove={handleDragMove}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<Rect
					{...drawerStyle.element}
					ref={(ref) => setMainShapeRef(ref)}
					id={id}
					width={drawerSizes.width}
					height={drawerSizes.height}
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

