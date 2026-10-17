import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {
	ObservableInputsType,
	OperatorDefinition,
	CombineLatestElementProperties,
	combineLatestOperatorDefinition,
} from '@maklja/vision-simulator-model';

export interface ObservableInputsTypeSelectProps {
	value: ObservableInputsType;
	definition?: Pick<
		OperatorDefinition<CombineLatestElementProperties>['properties']['observableInputsType'],
		'label' | 'options'
	>;
	onChange?: (value: ObservableInputsType) => void;
}

export const ObservableInputsTypeSelect = ({
	value,
	definition = combineLatestOperatorDefinition.properties.observableInputsType,
	onChange,
}: ObservableInputsTypeSelectProps) => {
	return (
		<FormControl fullWidth size="small">
			<InputLabel shrink id="observable-input-type">
				{definition.label}
			</InputLabel>
			<Select
				labelId="observable-input-type"
				value={value}
				label={definition.label}
				onChange={(event: SelectChangeEvent<ObservableInputsType>) =>
					onChange?.(event.target.value as ObservableInputsType)
				}
			>
				{definition.options.map((option) => (
					<MenuItem key={option.value} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</Select>
			<FormHelperText>Type which will be used to pass observable inputs.</FormHelperText>
		</FormControl>
	);
};
