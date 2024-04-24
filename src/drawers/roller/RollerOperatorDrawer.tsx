import Konva from 'konva';
import { useState } from 'react';
import { Group, Rect, Text, Ellipse, Path } from 'react-konva';
import { useAnimationGroups } from '../../animation';
import { RectangleDrawerProps } from '../DrawerProps';
import { useElementDrawerTheme } from '../../theme';
import { Point } from '../../model';
import { handleDragBoundFunc } from '../utils';

export interface RollerOperatorDrawerProps extends RectangleDrawerProps {
	title: string;
}

export function RollerOperatorDrawer({
	x,
	y,
	size,
	id,
	theme,
	highlight,
	select,
	visible = true,
	title,
	animation,
	draggable = false,
	hasError = false,
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onMouseUp,
	onDragMove,
	onDragStart,
	onDragEnd,
	onDragBound,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: RollerOperatorDrawerProps) {
	const drawerStyle = useElementDrawerTheme(theme, {
		highlight,
		select,
		hasError,
	});
	const { width, height, fontSizes } = size;
	const [leftEllipseShapeRef, setLeftEllipseShapeRef] = useState<Konva.Ellipse | null>(null);
	const [rightEllipseShapeRef, setRightEllipseShapeRef] = useState<Konva.Ellipse | null>(null);
	const [bodyShapeRef, setBodyShapeRef] = useState<Konva.Path | null>(null);

	const [mainTextRef, setMainTextRef] = useState<Konva.Text | null>(null);
	useAnimationGroups(animation, {
		animationFactories: [
			{
				node: leftEllipseShapeRef,
				mapper: (a) => ({
					config: a.mainShape,
				}),
			},
			{
				node: rightEllipseShapeRef,
				mapper: (a) => ({
					config: a.mainShape,
				}),
			},
			{
				node: bodyShapeRef,
				mapper: (a) => ({
					config: a.mainShape,
				}),
			},
			{
				node: mainTextRef,
				mapper: (a) => ({
					config: a.text,
				}),
			},
		],
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		drawerId: id,
	});

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

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseUp?.({
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

	const textX = (mainTextRef?.width() ?? 0) / -2 + width / 2;
	const textY = (mainTextRef?.height() ?? 0) / -2 + height / 2;

	const area = width * height * 0.1;
	const radiusY = height / 2;
	const radiusX = area / (Math.PI * radiusY);

	const leftSideTopControlPoint: Point = {
		x: 2.75 * radiusX,
		y: radiusY / 2,
	};
	const leftSideBottomControlPoint: Point = {
		x: 2.75 * radiusX,
		y: (3 * radiusY) / 2,
	};

	const rightSideTopControlPoint: Point = {
		x: -leftSideTopControlPoint.x + width,
		y: leftSideTopControlPoint.y,
	};
	const rightSideBottomControlPoint: Point = {
		x: -leftSideBottomControlPoint.x + width,
		y: leftSideBottomControlPoint.y,
	};

	const gap = 1.85;
	const isVisible =
		visible &&
		Boolean(mainTextRef) &&
		Boolean(leftEllipseShapeRef) &&
		Boolean(rightEllipseShapeRef) &&
		Boolean(bodyShapeRef);
	return (
		<Group
			visible={isVisible}
			x={x}
			y={y}
			draggable={draggable}
			dragBoundFunc={handleDragBoundFunc(id, onDragBound)}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<Rect
				x={radiusX}
				width={width - 2 * radiusX}
				height={height}
				fill={theme.colors.backgroundPrimaryColor}
			/>

			<Ellipse
				{...drawerStyle.element.primary}
				x={radiusX}
				y={radiusY}
				ref={(ref) => setLeftEllipseShapeRef(ref)}
				id={id}
				radiusX={radiusX}
				radiusY={radiusY}
			/>

			<Ellipse
				{...drawerStyle.element.primary}
				x={width - radiusX}
				y={radiusY}
				ref={(ref) => setRightEllipseShapeRef(ref)}
				id={id}
				radiusX={radiusX}
				radiusY={radiusY}
			/>

			<Path
				{...drawerStyle.element.primary}
				ref={(ref) => setBodyShapeRef(ref)}
				data={`M${radiusX * gap},0 
				C${leftSideTopControlPoint.x},${leftSideTopControlPoint.y} 
				${leftSideBottomControlPoint.x},${leftSideBottomControlPoint.y} 
				${radiusX * gap},${2 * radiusY}
				H ${-gap * radiusX + width}
				C${rightSideBottomControlPoint.x},${rightSideBottomControlPoint.y} 
				${rightSideTopControlPoint.x},${rightSideTopControlPoint.y} 
				${-gap * radiusX + width},0 
				Z`}
			/>
			<Text
				{...drawerStyle.text}
				ref={(ref) => setMainTextRef(ref)}
				text={title}
				x={textX}
				y={textY}
				fontSize={fontSizes.primary}
				listening={false}
				align="center"
				verticalAlign="middle"
			/>
		</Group>
	);
}
