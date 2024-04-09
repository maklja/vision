import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { formStyle } from '../commonStyles';
import { ExpandElementProperties } from '../../../model';
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
		<Stack gap={formStyle.componentGap}>
			<TextField
				id="expand-el-concurrent-prop"
				label="Concurrent"
				value={properties.concurrent}
				type="number"
				size="small"
				InputLabelProps={{
					shrink: true,
				}}
				InputProps={{
					inputProps: { min: 0 },
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
				label="Project"
				helperText="A function that, when applied to an item emitted by the source or the output Observable, returns an Observable."
				onCodeChange={handleProjectExpressionChanged}
			/>
		</Stack>
	);
}

