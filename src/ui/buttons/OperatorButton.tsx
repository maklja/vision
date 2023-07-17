import { Layer, Stage } from 'react-konva';
import { useState } from 'react';
import { useThemeContext } from '../../store/stageSlice';
import { findElementDrawerFactory } from '../../layers/drawer/createElementDrawer';
import { ElementType } from '../../model';

export interface OperatorButtonProps {
	elementType: ElementType;
	width: number;
	height: number;
	padding: number;
}

export const OperatorButton = ({
	elementType,
	width,
	height,
	padding = 0,
}: OperatorButtonProps) => {
	const size = 0.65;
	const [selected, setSelected] = useState(false);
	const theme = useThemeContext(elementType);
	const creationOperatorFactory = findElementDrawerFactory(elementType);

	if (!creationOperatorFactory) {
		return null;
	}

	const operatorDrawer = creationOperatorFactory({
		id: elementType,
		x: padding,
		y: padding,
		theme: theme,
		size,
		select: selected,
		onMouseOver: () => setSelected(true),
		onMouseOut: () => setSelected(false),
	});

	return (
		<Stage width={width + padding} height={height + padding}>
			<Layer>{operatorDrawer}</Layer>
		</Stage>
	);
};
