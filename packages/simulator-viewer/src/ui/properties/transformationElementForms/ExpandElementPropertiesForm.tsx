import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { ExpandElementProperties, expandOperatorDefinition } from '@maklja/vision-simulator-model';
import { formStyle } from '../commonStyles';
import { handleNumberInputChanged } from '../utils';
import { SimpleCodeEditor } from '../../code';

export interface ExpandElementPropertiesFormProps {
	id: string;
	properties: ExpandElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function ExpandElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: ExpandElementPropertiesFormProps) {
	const handleProjectExpressionChanged = (projectExpression: string) =>
		onPropertyValueChange?.(id, 'projectExpression', projectExpression);

	return (
		<Stack
			sx={{
				gap: formStyle.componentGap,
			}}
		>
			<TextField
				id="expand-el-concurrent-prop"
				label={expandOperatorDefinition.properties.concurrent.label}
				value={properties.concurrent}
				type="number"
				size="small"
				slotProps={{
					inputLabel: { shrink: true },
					htmlInput: { min: 0 },
				}}
				onChange={handleNumberInputChanged(
					id,
					'concurrent',
					properties.concurrent ?? Infinity,
					onPropertyValueChange,
				)}
				helperText="Maximum number of input Observables being subscribed to concurrently."
			/>

			<SimpleCodeEditor
				code={properties.projectExpression}
				label={expandOperatorDefinition.properties.projectExpression.label}
				helperText="A function that, when applied to an item emitted by the source or the output Observable, returns an Observable."
				onCodeChange={handleProjectExpressionChanged}
			/>
		</Stack>
	);
}
