import Konva from 'konva';
import { Circle, Group } from 'react-konva';
import { DrawerProps } from '../DrawerProps';
import { useState } from 'react';
import { useAnimationGroups } from '../../animation';
import { useElementDrawerTheme, useSizes } from '../../theme';

export const SubscriberDrawer = ({
	x,
	y,
	size,
	id,
	theme,
	highlight,
	select,
	animation,
	visible,
	onMouseDown,
	onMouseOut,
	onMouseOver,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
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
	useAnimationGroups(animation, {
		animationFactories: [
			{
				node: mainShapeRef,
				mapper: (a) => ({
					config: a.mainShape,
				}),
			},
			{
				node: innerShapeRef,
				mapper: (a) => ({
					config: a.secondaryShape,
				}),
			},
		],
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		drawerId: id,
	});

	const { drawerSizes } = useSizes(theme, size);
	const { drawerSizes: outerSizes } = useSizes(theme, size, 0.4);
	const { drawerSizes: innerSizes } = useSizes(theme, size, 0.2);

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

	return (
		<Group
			visible={visible && Boolean(mainShapeRef)}
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
	);
};

