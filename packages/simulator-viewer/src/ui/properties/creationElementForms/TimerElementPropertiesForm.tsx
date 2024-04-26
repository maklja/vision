import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { formStyle } from '../commonStyles';
import { DueDateType, TimerElementProperties } from '../../../model';
import { handleNumberInputChanged } from '../utils';

export interface TimerElementPropertiesFormProps {
	id: string;
	properties: TimerElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function TimerElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: TimerElementPropertiesFormProps) {
	const handleDueDateChanged = (e: dayjs.Dayjs | null) => {
		if (!e) {
			return;
		}

		onPropertyValueChange?.(id, 'startDue', e.toDate().getTime());
	};

	const handleDueDateTypeChanged = (e: SelectChangeEvent<DueDateType>) => {
		const newDueDateType = e.target.value as DueDateType;
		const newDateDate =
			newDueDateType === DueDateType.Date
				? dayjs().add(1, 'minute').toDate().getTime()
				: 1_000;
		onPropertyValueChange?.(id, 'startDue', newDateDate);
		onPropertyValueChange?.(id, 'dueDateType', newDueDateType);
	};

	return (
		<Stack gap={formStyle.componentGap}>
			<FormGroup sx={{ gap: formStyle.componentGap, flexWrap: 'nowrap' }}>
				<FormControl size="small">
					<InputLabel id="timer-el-due-date-type-prop-label">Due date type</InputLabel>
					<Select
						labelId="timer-el-due-date-type-prop-label"
						value={properties.dueDateType}
						label="Due date type"
						onChange={handleDueDateTypeChanged}
					>
						<MenuItem value={DueDateType.Milliseconds}>Milliseconds</MenuItem>
						<MenuItem value={DueDateType.Date}>Date</MenuItem>
					</Select>
				</FormControl>
				{properties.dueDateType === DueDateType.Date ? (
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DemoContainer components={['DateTimeField']}>
							<DateTimeField
								size="small"
								label="Due date"
								value={dayjs(properties.startDue)}
								helperText="The exact time at which to emit."
								onChange={handleDueDateChanged}
							/>
						</DemoContainer>
					</LocalizationProvider>
				) : (
					<TextField
						id="timer-el-due-ms-prop"
						label="Due milliseconds"
						value={properties.startDue}
						type="number"
						size="small"
						InputLabelProps={{
							shrink: true,
						}}
						InputProps={{
							inputProps: { min: 0 },
						}}
						helperText="The amount of time in milliseconds to wait before emitting."
						onChange={handleNumberInputChanged(
							id,
							'startDue',
							properties.startDue,
							onPropertyValueChange,
						)}
					/>
				)}
			</FormGroup>

			<TextField
				id="timer-el-interval-duration-prop"
				label="Interval duration"
				type="number"
				size="small"
				value={properties.intervalDuration}
				InputLabelProps={{
					shrink: true,
				}}
				InputProps={{
					inputProps: { min: -1 },
				}}
				helperText="The delay between each value emitted in the interval. Passing a negative number here will result in immediate completion after the first value is emitted, as though no interval duration was passed at all."
				onChange={handleNumberInputChanged(
					id,
					'intervalDuration',
					properties.intervalDuration,
					onPropertyValueChange,
				)}
			/>
		</Stack>
	);
}

