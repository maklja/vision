import { Box, Paper } from '@mui/material';
import { ElementExplorer } from './ElementExplorer';
import { Element, Point } from '../../model';
import { ElementPropertiesForm } from './ElementPropertiesForm';

export interface OperatorPropertiesPanelProps {
	element: Element;
	onPositionChange?: (id: string, position: Point) => void;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const OperatorPropertiesPanel = ({
	element,
	onPositionChange,
	onPropertyValueChange,
}: OperatorPropertiesPanelProps) => {
	return (
		<Box
			sx={{
				width: '100%',
				height: '100%',
			}}
		>
			<Paper
				sx={{
					width: '100%',
					height: '100%',
				}}
				elevation={0}
			>
				<ElementExplorer
					id={element.id}
					scale={element.scale}
					type={element.type}
					x={element.x}
					y={element.y}
					onPositionChange={onPositionChange}
				/>

				<ElementPropertiesForm
					id={element.id}
					type={element.type}
					properties={element.properties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			</Paper>
		</Box>
	);
};

