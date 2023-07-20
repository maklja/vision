import { Layer } from 'react-konva';
import { XYCoord, useDragLayer } from 'react-dnd';
import { Element } from '../../model';
import { useThemeContext } from '../../store/stageSlice';
import { DragNDropType } from '../../dragNDrop';
import { findElementDrawerFactory } from '../../factory';

interface DragCollectedProps {
	item: Element;
	itemType: DragNDropType | null;
	clientOffset: XYCoord | null;
	isDragging: boolean;
}

export const DragNDropLayer = () => {
	const theme = useThemeContext();
	const { itemType, isDragging, item, clientOffset } = useDragLayer<DragCollectedProps>(
		(monitor) => ({
			item: monitor.getItem(),
			itemType: monitor.getItemType() as DragNDropType,
			clientOffset: monitor.getClientOffset(),
			isDragging: monitor.isDragging(),
		}),
	);

	if (!isDragging || itemType !== DragNDropType.CreateElement) {
		return null;
	}

	const operatorFactory = findElementDrawerFactory(item.type);
	if (!operatorFactory) {
		return null;
	}

	const operatorDrawer = operatorFactory({
		...item,
		x: clientOffset?.x ?? 0,
		y: clientOffset?.y ?? 0,
		theme,
	});

	return <Layer>{operatorDrawer}</Layer>;
};

