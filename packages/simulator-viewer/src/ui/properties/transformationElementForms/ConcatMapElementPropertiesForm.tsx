import Stack from '@mui/material/Stack';
import {
	ConcatMapElementProperties,
	concatMapOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { formStyle } from '../commonStyles';
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
		<Stack
			sx={{
				gap: formStyle.componentGap,
			}}
		>
			<SimpleCodeEditor
				code={properties.projectExpression}
				label={concatMapOperatorDefinition.properties.projectExpression.label}
				helperText="A function that, when applied to an item emitted by the source Observable, returns an Observable."
				onCodeChange={handleProjectExpressionChanged}
			/>
		</Stack>
	);
};
