import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { ElementExplorer } from './ElementExplorer';
import { Element, Point } from '../../model';
import { ElementPropertiesForm, RelatedElements } from './ElementPropertiesForm';

export interface OperatorPropertiesPanelProps {
	element: Element;
	elementNames: string[];
	relatedElements: RelatedElements;
	onPositionChange?: (id: string, position: Point) => void;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
	onConnectLineChange?: (id: string, changes: { index?: number; name?: string }) => void;
	onNameChange?: (id: string, name: string) => void;
}

export const OperatorPropertiesPanel = ({
	element,
	elementNames,
	relatedElements,
	onPositionChange,
	onPropertyValueChange,
	onConnectLineChange,
	onNameChange,
}: OperatorPropertiesPanelProps) => {
	return (
		<Box
			key={element.id}
			sx={{
				width: '100%',
				height: '100%',
				maxWidth: '400px',
			}}
		>
			<Paper
				sx={{
					width: '100%',
					height: '100%',
					borderTopLeftRadius: '0px',
					borderTopRightRadius: '0px',
				}}
				elevation={0}
			>
				<ElementExplorer
					element={element}
					elementNames={elementNames}
					onPositionChange={onPositionChange}
					onNameChange={onNameChange}
				/>

				<Box sx={{ margin: '2px 0px' }} />

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

