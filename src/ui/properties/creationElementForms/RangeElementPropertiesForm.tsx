import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { formStyle } from '../commonStyles';
import { RangeElementProperties } from '../../../model';
import { handleNumberInputChanged, handleOptionalNumberInputChanged } from '../utils';

export interface RangeElementPropertiesFormProps {
	id: string;
	properties: RangeElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const RangeElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: RangeElementPropertiesFormProps) => {
	return (
		<Stack gap={formStyle.componentGap}>
			<TextField
				id="range-el-start-prop"
				label="Start"
				value={properties.start}
				type="number"
				size="small"
				InputLabelProps={{
					shrink: true,
				}}
				onChange={handleNumberInputChanged(
					id,
					'start',
					properties.start,
					onPropertyValueChange,
				)}
				helperText="The value of the first integer in the sequence."
			/>

			<TextField
				id="range-el-count-prop"
				label="Count"
				value={properties.count}
				type="number"
				size="small"
				InputLabelProps={{
					shrink: true,
				}}
				InputProps={{
					inputProps: { min: 0 },
				}}
				onChange={handleOptionalNumberInputChanged(
					id,
					'count',
					properties.count,
					onPropertyValueChange,
				)}
				helperText="The number of sequential integers to generate."
			/>
		</Stack>
	);
};

