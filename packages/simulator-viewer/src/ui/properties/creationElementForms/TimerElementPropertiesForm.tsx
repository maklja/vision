import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {
	DueDateType,
	ElementType,
	TimerElementProperties,
	timerOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { ParameterEditor } from '../ParameterEditor';
import { formStyle } from '../commonStyles';

export interface TimerElementPropertiesFormProps {
	id: string;
	properties: TimerElementProperties;
	onPropertiesChange?: (id: string, properties: Partial<TimerElementProperties>) => void;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function TimerElementPropertiesForm({
	id,
	properties,
	onPropertiesChange,
	onPropertyValueChange,
}: TimerElementPropertiesFormProps) {
	const handleDueDateTypeChanged = (e: SelectChangeEvent<DueDateType>) => {
		const newDueDateType = e.target.value as DueDateType;
		const newDateDate =
			newDueDateType === DueDateType.Date
				? dayjs().add(1, 'minute').toDate().getTime()
				: 1_000;
		// Persistence subscribers observe every store update, so keep these fields together.
		onPropertiesChange?.(id, {
			dueDateType: newDueDateType,
			startDue: {
				kind: 'literal',
				type: newDueDateType === DueDateType.Date ? 'date' : 'number',
				value: newDateDate,
			},
		});
	};

	return (
		<Stack
			sx={{
				gap: formStyle.componentGap,
			}}
		>
			<FormGroup sx={{ gap: formStyle.componentGap, flexWrap: 'nowrap' }}>
				<FormControl size="small">
					<InputLabel id="timer-el-due-date-type-prop-label">
						{timerOperatorDefinition.properties.dueDateType.label}
					</InputLabel>
					<Select
						labelId="timer-el-due-date-type-prop-label"
						value={properties.dueDateType}
						label={timerOperatorDefinition.properties.dueDateType.label}
						onChange={handleDueDateTypeChanged}
					>
						{timerOperatorDefinition.properties.dueDateType.options.map(
							({ value, label }) => (
								<MenuItem key={value} value={value}>
									{label}
								</MenuItem>
							),
						)}
					</Select>
				</FormControl>
				<ParameterEditor
					key={`${id}:startDue:${properties.dueDateType}`}
					id={id}
					field="startDue"
					label={
						properties.dueDateType === DueDateType.Date
							? 'Due date'
							: timerOperatorDefinition.properties.startDue.label
					}
					type={properties.dueDateType === DueDateType.Date ? 'date' : 'number'}
					value={properties.startDue}
					elementType={ElementType.Timer}
					properties={properties}
					help="Relative milliseconds >= 0, or an integral UTC epoch date (past dates emit immediately)."
					onChange={onPropertyValueChange}
				/>
			</FormGroup>
			<ParameterEditor
				key={`${id}:intervalDuration`}
				id={id}
				field="intervalDuration"
				label={timerOperatorDefinition.properties.intervalDuration.label}
				value={properties.intervalDuration}
				elementType={ElementType.Timer}
				properties={properties}
				help="Milliseconds >= 0, or -1 for one emission."
				onChange={onPropertyValueChange}
			/>
		</Stack>
	);
}
