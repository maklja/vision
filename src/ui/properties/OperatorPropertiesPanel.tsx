import { Box, Paper } from '@mui/material';
import { ElementExplorer } from './ElementExplorer';
import { Element, Point } from '../../model';
import { ElementPropertiesForm, RelatedElements } from './ElementPropertiesForm';

export interface OperatorPropertiesPanelProps {
	element: Element;
	relatedElements: RelatedElements;
	onPositionChange?: (id: string, position: Point) => void;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const OperatorPropertiesPanel = ({
	element,
	relatedElements,
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
				<ElementExplorer element={element} onPositionChange={onPositionChange} />

				<ElementPropertiesForm
					element={element}
					relatedElements={relatedElements}
					onPropertyValueChange={onPropertyValueChange}
				/>
			</Paper>
		</Box>
	);
};
