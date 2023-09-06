import { ChangeEventHandler } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { IntervalElementProperties } from '../../../model';

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
	const handlePeriodChanged: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
		const newPeriodValue = Number(e.target.value);
		onPropertyValueChange?.(
			id,
			'period',
			isNaN(newPeriodValue) ? properties.period : newPeriodValue,
		);
	};

	return (
		<Stack gap={1.5}>
			<TextField
				id="interval-el-period-prop"
				label="Period"
				value={properties.period}
				type="number"
				size="small"
				InputLabelProps={{
					shrink: true,
				}}
				onChange={handlePeriodChanged}
				helperText="The interval size in milliseconds (by default) or the time unit determined by the scheduler's clock."
			/>
		</Stack>
	);
};

