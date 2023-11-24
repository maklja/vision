import { Box, Paper } from '@mui/material';
import { ElementExplorer } from './ElementExplorer';
import { Element, Point } from '../../model';
import { ElementPropertiesForm, RelatedElements } from './ElementPropertiesForm';

export interface OperatorPropertiesPanelProps {
	element: Element;
	relatedElements: RelatedElements;
	onPositionChange?: (id: string, position: Point) => void;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
	onConnectLineChange?: (id: string, changes: { index?: number; name?: string }) => void;
}

export const OperatorPropertiesPanel = ({
	element,
	relatedElements,
	onPositionChange,
	onPropertyValueChange,
	onConnectLineChange,
}: OperatorPropertiesPanelProps) => {
	return (
		<Box
			key={element.id}
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
					onConnectLineChange={onConnectLineChange}
				/>
			</Paper>
		</Box>
	);
};
