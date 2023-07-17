import { Layer, Stage } from 'react-konva';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { useThemeContext } from '../../store/stageSlice';
import { findElementDrawerFactory } from '../../layers/drawer/createElementDrawer';
import { ElementGroup, ElementType, mapElementTypeToGroup } from '../../model';
import { useSizes } from '../../theme';
import { useDrag } from 'react-dnd';

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
	const [selected, setSelected] = useState(false);
	const [{ opacity }, dragRef] = useDrag(
		() => ({
			type: elementType,
			item: {
				elementType,
			},
			collect: (monitor) => ({
				opacity: monitor.isDragging() ? 0.5 : 1,
			}),
		}),
		[],
	);

	const theme = useThemeContext(elementType);
	const { drawerSizes } = useSizes(theme, size);

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
		select: selected,
		onMouseOver: () => setSelected(true),
		onMouseOut: () => setSelected(false),
	});

	return (
		<Box ref={dragRef} sx={{ opacity, backgroundColor: 'transparent' }}>
			<Stage width={width + 2 * padding} height={height + 2 * padding}>
				<Layer>{operatorDrawer}</Layer>
			</Stage>
		</Box>
	);
};

