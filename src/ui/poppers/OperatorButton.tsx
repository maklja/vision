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
import { calculateShapeSizeBoundingBox } from '../../theme';
import { OperatorDrawer } from '../../factory';

export interface OperatorButtonProps {
	elementType: ElementType;
	padding?: number;
	size?: number;
}

export const OperatorButton = ({ elementType, padding = 4, size = 0.65 }: OperatorButtonProps) => {
	const appDispatch = useAppDispatch();
	const theme = useThemeContext(elementType);
	const shapeSize = useShapeSize(elementType);
	const bb = calculateShapeSizeBoundingBox({ x: padding, y: padding }, shapeSize);
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

	const element: Element = {
		id: elementType,
		size: 1,
		type: elementType,
		visible: true,
		x: bb.center.x,
		y: bb.center.y,
		properties: {},
	};

	return (
		<Box ref={dragRef}>
			<Stage width={bb.width + 2 * padding} height={bb.height + 2 * padding}>
				<Layer>
					<OperatorDrawer element={element} visibleConnectPoints={false} />
				</Layer>
			</Stage>
		</Box>
	);
};
