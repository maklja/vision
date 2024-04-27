import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { IntervalElementProperties } from '@maklja/vision-simulator-model';
import { formStyle } from '../commonStyles';
import { handleNumberInputChanged } from '../utils';

export interface IntervalElementPropertiesFormProps {
	id: string;
	properties: IntervalElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function IntervalElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: IntervalElementPropertiesFormProps) {
	return (
		<Stack gap={formStyle.componentGap}>
			<TextField
				id="interval-el-period-prop"
				label="Period"
				value={properties.period}
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
					'period',
					properties.period,
					onPropertyValueChange,
				)}
				helperText="The interval size in milliseconds (by default) or the time unit determined by the scheduler's clock."
			/>
		</Stack>
	);
}
