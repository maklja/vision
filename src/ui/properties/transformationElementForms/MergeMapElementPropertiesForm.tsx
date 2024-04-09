import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { formStyle } from '../commonStyles';
import { MergeMapElementProperties } from '../../../model';
import { handleNumberInputChanged } from '../utils';
import { SimpleCodeEditor } from '../../code';

export interface MergeMapElementPropertiesFormProps {
	id: string;
	properties: MergeMapElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function MergeMapElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: MergeMapElementPropertiesFormProps) {
	const handleProjectExpressionChanged = (projectExpression: string) =>
		onPropertyValueChange?.(id, 'projectExpression', projectExpression);

	return (
		<Stack gap={formStyle.componentGap}>
			<TextField
				id="merge-map-el-concurrent-prop"
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
				helperText="A function that, when applied to an item emitted by the source Observable, returns an Observable."
				onCodeChange={handleProjectExpressionChanged}
			/>
		</Stack>
	);
}

