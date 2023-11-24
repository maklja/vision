import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { IntervalElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';
import { formStyle } from '../commonStyles';

export interface IntervalElementPropertiesFormProps {
	id: string;
	properties: IntervalElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const IntervalElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: IntervalElementPropertiesFormProps) => {
	const handlePreInputObservableCreation = (input: string) =>
		onPropertyValueChange?.(id, 'preInputObservableCreation', input.trim());

	return (
		<Stack gap={formStyle.componentGap}>
			<TextField
				id="interval-el-period-prop"
				label="Period"
				value={properties.period}
				type="text"
				size="small"
				InputLabelProps={{
					shrink: true,
				}}
				onChange={(e) => onPropertyValueChange?.(id, 'period', e.currentTarget.value)}
				helperText="The interval size in milliseconds (by default) or the time unit determined by the scheduler's clock."
			/>

			<SimpleCodeEditor
				code={properties.preInputObservableCreation}
				label="Pre code execution"
				helperText="Hook that will be executed before input observable is created."
				onCodeChange={handlePreInputObservableCreation}
			/>
		</Stack>
	);
};
