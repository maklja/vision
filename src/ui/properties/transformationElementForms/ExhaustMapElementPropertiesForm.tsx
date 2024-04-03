import Stack from '@mui/material/Stack';
import { formStyle } from '../commonStyles';
import { ExhaustMapElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';

export interface ExhaustMapElementPropertiesFormProps {
	id: string;
	properties: ExhaustMapElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const ExhaustMapElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: ExhaustMapElementPropertiesFormProps) => {
	const handleProjectExpressionChanged = (projectExpression: string) =>
		onPropertyValueChange?.(id, 'projectExpression', projectExpression);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.projectExpression}
				label="Project"
				helperText="A function that, when applied to an item emitted by the source Observable, returns an Observable."
				onCodeChange={handleProjectExpressionChanged}
			/>
		</Stack>
	);
};

