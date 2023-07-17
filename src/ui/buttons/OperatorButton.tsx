import { Layer, Stage } from 'react-konva';
import { useState } from 'react';
import { useThemeContext } from '../../store/stageSlice';
import { findElementDrawerFactory } from '../../layers/drawer/createElementDrawer';
import { ElementType, mapElementTypeToGroup } from '../../model';
import { useSizes, circleShapeElementGroups } from '../../theme';

export interface OperatorButtonProps {
	elementType: ElementType;
	padding?: number;
	size?: number;
}

export const OperatorButton = ({ elementType, padding = 4, size = 0.65 }: OperatorButtonProps) => {
	const theme = useThemeContext(elementType);
	const { drawerSizes } = useSizes(theme, size);
	const [selected, setSelected] = useState(false);

	const elGroup = mapElementTypeToGroup(elementType);
	const width = circleShapeElementGroups.has(elGroup)
		? drawerSizes.radius * 2
		: drawerSizes.width;
	const height = circleShapeElementGroups.has(elGroup)
		? drawerSizes.radius * 2
		: drawerSizes.height;

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
		<Stage width={width + 2 * padding} height={height + 2 * padding}>
			<Layer>{operatorDrawer}</Layer>
		</Stage>
	);
};

