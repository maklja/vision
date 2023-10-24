import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { Layer } from 'react-konva';
import { XYCoord, useDragLayer } from 'react-dnd';
import { Element, ElementType } from '../../model';
import {
	createDraftElementSnapLines,
	selectElementSizeOptions,
	updateDraftElementPosition,
	useThemeContext,
} from '../../store/stageSlice';
import { DragNDropType } from '../../dragNDrop';
import { createOperatorDrawer } from '../../operatorDrawers';
import { ShapeSize, calculateShapeSizeBoundingBox, useGridTheme } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/rootState';
import { selectStageDraftElement } from '../../store/elements';
import { calcSnapPosition } from '../../drawers';

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

export interface DragNDropLayerProps {
	snapToGrid: boolean;
}

export const DragNDropLayer = ({ snapToGrid }: DragNDropLayerProps) => {
	const appDispatch = useAppDispatch();
	const theme = useThemeContext();
	const gridTheme = useGridTheme(theme);
	const elementSizeOptions = useAppSelector(selectElementSizeOptions);
	const draftElement = useAppSelector(selectStageDraftElement) ?? {
		id: '',
		type: ElementType.Empty,
		visible: false,
		x: 0,
		y: 0,
		properties: {},
	};
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

		appDispatch(updateDraftElementPosition(newPosition));
		appDispatch(createDraftElementSnapLines());
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

