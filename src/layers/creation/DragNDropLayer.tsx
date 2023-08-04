import { useRef } from 'react';
import Konva from 'konva';
import { Layer } from 'react-konva';
import { XYCoord, useDragLayer } from 'react-dnd';
import { Element } from '../../model';
import { useThemeContext } from '../../store/stageSlice';
import { DragNDropType } from '../../dragNDrop';
import { createOperatorDrawer } from '../../operatorDrawers';
import { ShapeSize, calculateShapeSizeBoundingBox } from '../../theme';

export interface DragNDropItem {
	element: Element;
	shapeSize: ShapeSize;
}

interface DragCollectedProps {
	item: DragNDropItem;
	itemType: DragNDropType | null;
	clientOffset: XYCoord | null;
	isDragging: boolean;
}

export const DragNDropLayer = () => {
	const theme = useThemeContext();
	const layerRef = useRef<Konva.Layer | null>(null);

	const { itemType, isDragging, item, clientOffset } = useDragLayer<DragCollectedProps>(
		(monitor) => ({
			item: monitor.getItem(),
			itemType: monitor.getItemType() as DragNDropType,
			clientOffset: monitor.getClientOffset(),
			isDragging: monitor.isDragging(),
		}),
	);
	if (!item || !isDragging || itemType !== DragNDropType.CreateElement) {
		return null;
	}

	const position = layerRef.current?.getStage().getPosition() ?? null;
	const { element, shapeSize } = item;
	const bb = calculateShapeSizeBoundingBox({ x: 0, y: 0 }, shapeSize);
	const xPosition = (clientOffset?.x ?? 0) - (position?.x ?? 0) - bb.width / 2;
	const yPosition = (clientOffset?.y ?? 0) - (position?.y ?? 0) - bb.height / 2;

	const drawer = createOperatorDrawer(element.type, {
		id: element.id,
		x: xPosition,
		y: yPosition,
		scale: element.scale,
		visible: element.visible,
		select: true,
		draggable: false,
		theme,
	});
	return <Layer ref={layerRef}>{drawer}</Layer>;
};

