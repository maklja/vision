import Stack from '@mui/material/Stack';
import { formStyle } from '../commonStyles';
import { MapElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';

export interface MapElementPropertiesFormProps {
	id: string;
	properties: MapElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function MapElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: MapElementPropertiesFormProps) {
	const handleProjectExpressionChanged = (projectExpression: string) =>
		onPropertyValueChange?.(id, 'projectExpression', projectExpression);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.projectExpression}
				label="Project"
				helperText="The function to apply to each value emitted by the source Observable. The index parameter is the number i for the i-th emission that has happened since the subscription, starting from the number 0."
				onCodeChange={handleProjectExpressionChanged}
			/>
		</Stack>
	);
}

