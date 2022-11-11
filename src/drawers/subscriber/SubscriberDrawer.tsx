import Konva from 'konva';
import { Circle, Group } from 'react-konva';
import { DRAWER_DEFAULT, fromSize } from '../utils';
import { highlightElementAnimation, useDrawerTheme, useElementDrawerTheme } from '../../theme';
import { DrawerAnimations, DrawerProps } from '../DrawerProps';
import { useEffect, useState } from 'react';
import { useAnimation, useAnimationGroups, Animation } from '../../animation';

export const SubscriberDrawer = (props: DrawerProps) => {
	const { colors } = useDrawerTheme();
	const drawerStyle = useElementDrawerTheme({
		highlight: props.highlight,
		select: props.select,
	});
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const mainShapeHighlightAnimation = useAnimation(mainShapeRef, highlightElementAnimation);
	const highlightAnimation = useAnimationGroups(mainShapeHighlightAnimation);

	const createAnimation = (): DrawerAnimations => ({
		highlight: highlightAnimation,
	});

	const {
		x,
		y,
		size,
		id,
		onMouseDown,
		onMouseOut,
		onMouseOver,
		onDragMove,
		onDragStart,
		onDragEnd,
		onAnimationDestroy,
		onAnimationReady,
	} = props;
	const radius = fromSize(DRAWER_DEFAULT.radius, size);
	const outerRadius = fromSize(DRAWER_DEFAULT.radius, size, 0.8);
	const innerRadius = fromSize(DRAWER_DEFAULT.radius, size, 0.5);

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
				radius={outerRadius}
				x={radius}
				y={radius}
			/>
			<Circle
				radius={innerRadius}
				x={radius}
				y={radius}
				listening={false}
				fill={props.highlight || props.select ? colors.primaryColor : colors.secondaryColor}
			/>
		</Group>
	);
};
