import { Box, Paper } from '@mui/material';
import { ElementExplorer } from './ElementExplorer';
import { Element, Point } from '../../model';

export interface OperatorPropertiesPanelProps {
	element: Element;
	onPositionChange?: (id: string, position: Point) => void;
}

export const OperatorPropertiesPanel = ({
	element,
	onPositionChange,
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
			</Paper>
		</Box>
	);
};
