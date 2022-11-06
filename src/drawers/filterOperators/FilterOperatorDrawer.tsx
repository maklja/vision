import Konva from 'konva';
import { useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { elementTextTheme, elementTheme } from '../../theme';
import { DrawerProps } from '../DrawerProps';
import { DRAWER_DEFAULT, fromSize } from '../utils';

export const FilterOperatorDrawer = (props: DrawerProps) => {
	const [mainTextRef, setMainTextRef] = useState<Konva.Text | null>(null);

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
	} = props;

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOver?.(id, e);

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOut?.(id, e);

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown?.(id, e);

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) => onDragMove?.(id, e);

	const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) => onDragStart?.(id, e);

	const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => onDragEnd?.(id, e);

	const width = fromSize(DRAWER_DEFAULT.width, size);
	const height = fromSize(DRAWER_DEFAULT.height, size);
	const textFontSize = fromSize(DRAWER_DEFAULT.textFontSize, size);

	const textX = (mainTextRef?.textWidth ?? 0) / -2 + width / 2;
	const textY = mainTextRef?.textHeight ?? 0;

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
			<Rect {...elementTheme} id={id} width={width} height={height} />
			<Text
				ref={(ref) => setMainTextRef(ref)}
				text={'filter'}
				x={textX}
				y={textY}
				fontSize={textFontSize}
				listening={false}
				{...elementTextTheme}
			/>
		</Group>
	);
};
