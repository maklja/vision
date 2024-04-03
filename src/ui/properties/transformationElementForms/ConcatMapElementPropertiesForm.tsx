import Stack from '@mui/material/Stack';
import { formStyle } from '../commonStyles';
import { ConcatMapElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';

export interface ConcatMapElementPropertiesFormProps {
	id: string;
	properties: ConcatMapElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const ConcatMapElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: ConcatMapElementPropertiesFormProps) => {
	const handleProjectExpressionChanged = (projectExpression: string) =>
		onPropertyValueChange?.(id, 'projectExpression', projectExpression);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.projectExpression}
				label="Closing selector"
				helperText="A function that, when applied to an item emitted by the source Observable, returns an Observable."
				onCodeChange={handleProjectExpressionChanged}
			/>
		</Stack>
	);
};

