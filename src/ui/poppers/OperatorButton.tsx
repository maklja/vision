import { v1 } from 'uuid';
import { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { Layer, Stage } from 'react-konva';
import { getEmptyImage } from 'react-dnd-html5-backend';
import Box from '@mui/material/Box';
import { createDraftElement, useShapeSize, useThemeContext } from '../../store/stageSlice';
import { Element, ElementType } from '../../model';
import { DragNDropType } from '../../dragNDrop';
import { useAppDispatch } from '../../store/rootState';
import { calculateShapeSizeBoundingBox, scaleShapeSize } from '../../theme';
import { createOperatorDrawer } from '../../operatorDrawers';
import { DragNDropItem } from '../../layers/creation';

export interface OperatorButtonProps {
	elementType: ElementType;
	padding?: number;
	scale?: number;
}

export const OperatorButton = ({ elementType, padding = 4, scale = 0.65 }: OperatorButtonProps) => {
	const appDispatch = useAppDispatch();
	const theme = useThemeContext(elementType);
	const shapeSize = useShapeSize(elementType);
	const buttonShapeSize = scaleShapeSize(shapeSize, scale);
	const buttonBoundingBox = calculateShapeSizeBoundingBox(
		{ x: padding, y: padding },
		buttonShapeSize,
	);
	const [highlighted, setHighlighted] = useState(false);

	const [{ isDragging }, dragRef, dragPreview] = useDrag<
		DragNDropItem,
		unknown,
		{ isDragging: boolean }
	>(
		() => ({
			type: DragNDropType.CreateElement,
			item: (monitor) => {
				const clientOffset = monitor.getClientOffset();
				const bb = calculateShapeSizeBoundingBox({ x: 0, y: 0 }, shapeSize);
				const xPosition = (clientOffset?.x ?? 0) - bb.width / 2;
				const yPosition = (clientOffset?.y ?? 0) - bb.height / 2;

				const newElement: Element = {
					id: v1(),
					x: xPosition,
					y: yPosition,
					scale: 1,
					visible: true,
					type: elementType,
					properties: {},
				};
				appDispatch(createDraftElement(newElement));

				return {
					element: newElement,
					shapeSize,
				};
			},
			collect: (monitor) => ({
				isDragging: monitor.isDragging(),
			}),
		}),
		[],
	);

	useEffect(() => {
		dragPreview(getEmptyImage(), { captureDraggingState: true });
	}, [dragPreview]);

	return (
		<Box ref={dragRef}>
			<Stage
				width={buttonBoundingBox.width + 2 * padding}
				height={buttonBoundingBox.height + 2 * padding}
			>
				<Layer>
					{createOperatorDrawer(elementType, {
						id: elementType,
						theme,
						x: buttonBoundingBox.x,
						y: buttonBoundingBox.y,
						scale,
						draggable: false,
						highlight: highlighted,
						select: isDragging,
						onMouseOver: () => setHighlighted(true),
						onMouseOut: () => setHighlighted(false),
					})}
				</Layer>
			</Stage>
		</Box>
	);
};

