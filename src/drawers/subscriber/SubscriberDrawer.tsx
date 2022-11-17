import Konva from 'konva';
import { Circle, Group } from 'react-konva';
import { DrawerAnimations, DrawerProps } from '../DrawerProps';
import { useEffect, useState } from 'react';
import { Animation } from '../../animation';
import { ConnectPointsDrawer } from '../connectPoints';
import { useHighlightSubscriberAnimation } from './animation/useHighlightSubscriberAnimation';
import { useElementDrawerTheme, useSizes } from '../../theme';

export const SubscriberDrawer = ({
	x,
	y,
	size,
	id,
	theme,
	highlight,
	select,
	visibleConnectionPoints,
	highlightedConnectPoints,
	onMouseDown,
	onMouseOut,
	onMouseOver,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationDestroy,
	onAnimationReady,
	onConnectPointMouseDown,
	onConnectPointMouseOut,
	onConnectPointMouseOver,
	onConnectPointMouseUp,
}: DrawerProps) => {
	const { colors } = theme;
	const drawerStyle = useElementDrawerTheme(
		{
			highlight,
			select,
		},
		theme,
	);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const [innerShapeRef, setInnerShapeRef] = useState<Konva.Circle | null>(null);
	const highlightAnimation = useHighlightSubscriberAnimation(mainShapeRef, innerShapeRef, theme);

	const createAnimation = (): DrawerAnimations => ({
		highlight: highlightAnimation,
		error: null,
	});

	const { drawerSizes } = useSizes(theme, size);
	const { drawerSizes: outerSizes } = useSizes(theme, size, 0.8);
	const { drawerSizes: innerSizes } = useSizes(theme, size, 0.5);

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
		<Group visible={Boolean(mainShapeRef)}>
			{visibleConnectionPoints ? (
				<ConnectPointsDrawer
					id={id}
					x={x + drawerSizes.radius / 2}
					y={y + drawerSizes.radius / 2}
					width={drawerSizes.radius}
					height={drawerSizes.radius}
					theme={theme}
					offset={24}
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
				onMouseDown={handleMouseDown}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				onDragMove={handleDragMove}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<Circle
					{...drawerStyle.element}
					ref={(node) => setMainShapeRef(node)}
					id={id}
					radius={outerSizes.radius}
					x={drawerSizes.radius}
					y={drawerSizes.radius}
				/>
				<Circle
					ref={(node) => setInnerShapeRef(node)}
					radius={innerSizes.radius}
					x={drawerSizes.radius}
					y={drawerSizes.radius}
					listening={false}
					fill={highlight || select ? colors.primaryColor : colors.secondaryColor}
				/>
			</Group>
		</Group>
	);
};

