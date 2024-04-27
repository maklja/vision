import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ObservableInputsType } from '@maklja/vision-simulator-model';

export interface ObservableInputsTypeSelectProps {
	value: ObservableInputsType;
	onChange?: (value: ObservableInputsType) => void;
}

export const ObservableInputsTypeSelect = ({
	value,
	onChange,
}: ObservableInputsTypeSelectProps) => {
	return (
		<FormControl fullWidth size="small">
			<InputLabel shrink id="observable-input-type">
				Observable input type
			</InputLabel>
			<Select
				labelId="observable-input-type"
				value={value}
				label="Observable input type"
				onChange={(event: SelectChangeEvent<ObservableInputsType>) =>
					onChange?.(event.target.value as ObservableInputsType)
				}
			>
				<MenuItem key={ObservableInputsType.Array} value={ObservableInputsType.Array}>
					Array
				</MenuItem>

				<MenuItem key={ObservableInputsType.Object} value={ObservableInputsType.Object}>
					Object
				</MenuItem>
			</Select>
			<FormHelperText>Type which will be used to pass observable inputs.</FormHelperText>
		</FormControl>
	);
};
