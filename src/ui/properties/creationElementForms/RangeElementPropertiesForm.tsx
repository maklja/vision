import { ChangeEventHandler } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { formStyle } from '../commonStyles';
import { RangeElementProperties } from '../../../model';

export interface RangeElementPropertiesForm {
	id: string;
	properties: RangeElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const RangeElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: RangeElementPropertiesForm) => {
	const handleStartChanged: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
		const newStartValue = Number(e.target.value);
		onPropertyValueChange?.(
			id,
			'start',
			isNaN(newStartValue) ? properties.start : newStartValue,
		);
	};

	const handleCountChanged: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
		if (!e.target.value) {
			return onPropertyValueChange?.(id, 'count', undefined);
		}

		const newCountValue = Number(e.target.value);
		onPropertyValueChange?.(
			id,
			'count',
			isNaN(newCountValue) ? properties.count : newCountValue,
		);
	};

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
				onChange={handleStartChanged}
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
				onChange={handleCountChanged}
				helperText="The number of sequential integers to generate."
			/>
		</Stack>
	);
};

