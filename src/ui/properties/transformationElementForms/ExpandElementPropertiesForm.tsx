import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { formStyle } from '../commonStyles';
import { ExpandElementProperties } from '../../../model';
import { handleNumberInputChanged } from '../utils';

export interface ExpandElementPropertiesFormProps {
	id: string;
	properties: ExpandElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const ExpandElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: ExpandElementPropertiesFormProps) => {
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
		</Stack>
	);
};

