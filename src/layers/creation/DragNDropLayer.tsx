import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { Layer } from 'react-konva';
import { XYCoord, useDragLayer } from 'react-dnd';
import { ElementType } from '../../model';
import { DragNDropType } from '../../dragNDrop';
import { createOperatorDrawer } from '../../operatorDrawers';
import { ShapeSize, calculateShapeSizeBoundingBox, useGridTheme } from '../../theme';
import { selectStageDraftElement } from '../../store/elements';
import { calcSnapPosition } from '../../drawers';
import { selectElementSizeOptions, useThemeContext } from '../../store/hooks';
import { useStore } from '../../store/rootStore';

export interface DragNDropItem {
	elementType: ElementType;
	shapeSize: ShapeSize;
}

interface DragCollectedProps {
	item: DragNDropItem;
	itemType: DragNDropType | null;
	clientOffset: XYCoord | null;
	isDragging: boolean;
}

export interface DragNDropLayerProps {
	snapToGrid: boolean;
}

export const DragNDropLayer = ({ snapToGrid }: DragNDropLayerProps) => {
	const theme = useThemeContext();
	const gridTheme = useGridTheme(theme);
	const elementSizeOptions = useStore(selectElementSizeOptions);
	const draftElement = useStore(selectStageDraftElement());
	const updateDraftElementPosition = useStore((state) => state.updateDraftElementPosition);
	const createDraftElementSnapLines = useStore((state) => state.createDraftElementSnapLines);
	const layerRef = useRef<Konva.Layer | null>(null);

	const { itemType, isDragging, item, clientOffset } = useDragLayer<DragCollectedProps>(
		(monitor) => ({
			item: monitor.getItem(),
			itemType: monitor.getItemType() as DragNDropType,
			clientOffset: monitor.getClientOffset(),
			isDragging: monitor.isDragging(),
		}),
	);

	useEffect(() => {
		const isAllowedToDrag = isDragging && itemType === DragNDropType.CreateElement;
		if (!isAllowedToDrag || !layerRef.current) {
			return;
		}

		const stage = layerRef.current.getStage();
		const position = stage.getPosition();
		const scale = stage.scale() ?? { x: 1, y: 1 };

		const bb = calculateShapeSizeBoundingBox({ x: 0, y: 0 }, item.shapeSize);
		const x = ((clientOffset?.x ?? 0) - position.x) / scale.x - bb.width / 2;
		const y = ((clientOffset?.y ?? 0) - position.y) / scale.y - bb.height / 2;

		const newPosition = snapToGrid
			? calcSnapPosition({ x, y }, gridTheme.size, stage)
			: { x, y };

		updateDraftElementPosition(newPosition);
		createDraftElementSnapLines();
	}, [snapToGrid, clientOffset, item, isDragging, itemType]);

	const drawer = createOperatorDrawer(draftElement.type, {
		id: draftElement.id,
		x: draftElement.x,
		y: draftElement.y,
		visible: draftElement.visible,
		properties: draftElement.properties,
		scale: elementSizeOptions.scale,
		select: true,
		draggable: false,
		theme,
	});

	return <Layer ref={layerRef}>{drawer}</Layer>;
};

