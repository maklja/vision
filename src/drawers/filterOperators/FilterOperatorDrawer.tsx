import Konva from 'konva';
import { useEffect, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { useAnimation, useAnimationGroups, Animation } from '../../animation';
import {
	highlightElementAnimation,
	highlightTextAnimation,
	useElementDrawerTheme,
} from '../../theme';
import { DrawerAnimations, DrawerProps } from '../DrawerProps';
import { DRAWER_DEFAULT, fromSize } from '../utils';

export const FilterOperatorDrawer = (props: DrawerProps) => {
	const drawerStyle = useElementDrawerTheme({
		highlight: props.highlight,
		select: props.select,
	});
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Rect | null>(null);
	const [mainTextRef, setMainTextRef] = useState<Konva.Text | null>(null);

	const mainShapeHighlightAnimation = useAnimation(mainShapeRef, highlightElementAnimation);
	const mainTextHighlightAnimation = useAnimation(mainTextRef, highlightTextAnimation);
	const highlightAnimation = useAnimationGroups(
		mainShapeHighlightAnimation,
		mainTextHighlightAnimation,
	);

	const createAnimation = (): DrawerAnimations => ({
		highlight: highlightAnimation,
	});

	const {
		x,
		y,
		size,
		id,
		onMouseOver,
		onMouseOut,
		onMouseDown,
		onDragMove,
		onDragStart,
		onDragEnd,
		onAnimationReady,
		onAnimationDestroy,
	} = props;

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

	const width = fromSize(DRAWER_DEFAULT.width, size);
	const height = fromSize(DRAWER_DEFAULT.height, size);
	const textFontSize = fromSize(DRAWER_DEFAULT.textFontSize, size);

	const textX = (mainTextRef?.textWidth ?? 0) / -2 + width / 2;
	const textY = (mainTextRef?.textHeight ?? 0) / -2 + height / 2;

	return (
		<Group
			x={x}
			y={y}
			visible={Boolean(mainTextRef)}
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
				width={width}
				height={height}
			/>
			<Text
				{...drawerStyle.text}
				ref={(ref) => setMainTextRef(ref)}
				text={'filter'}
				x={textX}
				y={textY}
				fontSize={textFontSize}
				listening={false}
			/>
		</Group>
	);
};
