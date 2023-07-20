import { v1 } from 'uuid';
import { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { Layer, Stage } from 'react-konva';
import { getEmptyImage } from 'react-dnd-html5-backend';
import Box from '@mui/material/Box';
import { createDraftElement, useThemeContext } from '../../store/stageSlice';
import { Element, ElementGroup, ElementType, mapElementTypeToGroup } from '../../model';
import { useSizes } from '../../theme';
import { DragNDropType } from '../../dragNDrop';
import { useAppDispatch } from '../../store/rootState';
import { findElementDrawerFactory } from '../../factory';

export interface OperatorButtonProps {
	elementType: ElementType;
	padding?: number;
	size?: number;
}

export const radiusDrawers: ReadonlySet<ElementGroup> = new Set([
	ElementGroup.Creation,
	ElementGroup.JoinCreation,
	ElementGroup.Subscriber,
]);

export const OperatorButton = ({ elementType, padding = 4, size = 0.65 }: OperatorButtonProps) => {
	const appDispatch = useAppDispatch();
	const theme = useThemeContext(elementType);
	const { drawerSizes } = useSizes(theme, size);
	const [highlighted, setHighlighted] = useState(false);

	const [{ isDragging }, dragRef, dragPreview] = useDrag<
		Element,
		unknown,
		{ isDragging: boolean }
	>(
		() => ({
			type: DragNDropType.CreateElement,
			item: (monitor) => {
				const clientOffset = monitor.getClientOffset();
				const newElement: Element = {
					id: v1(),
					x: clientOffset?.x ?? 0,
					y: clientOffset?.y ?? 0,
					size: 1,
					visible: true,
					type: elementType,
					properties: {},
				};
				appDispatch(createDraftElement(newElement));

				return newElement;
			},
			collect: (monitor) => ({
				isDragging: monitor.isDragging(),
			}),
		}),
		[],
	);

	useEffect(() => {
		dragPreview(getEmptyImage(), { captureDraggingState: true });
	}, []);

	const elGroup = mapElementTypeToGroup(elementType);
	const width = radiusDrawers.has(elGroup) ? drawerSizes.radius * 2 : drawerSizes.width;
	const height = radiusDrawers.has(elGroup) ? drawerSizes.radius * 2 : drawerSizes.height;

	const operatorFactory = findElementDrawerFactory(elementType);
	if (!operatorFactory) {
		return null;
	}

	const operatorDrawer = operatorFactory({
		id: elementType,
		x: padding,
		y: padding,
		theme,
		size,
		select: isDragging,
		highlight: highlighted,
		onMouseOver: () => setHighlighted(true),
		onMouseOut: () => setHighlighted(false),
	});

	return (
		<Box ref={dragRef}>
			<Stage width={width + 2 * padding} height={height + 2 * padding}>
				<Layer>{operatorDrawer}</Layer>
			</Stage>
		</Box>
	);
};
