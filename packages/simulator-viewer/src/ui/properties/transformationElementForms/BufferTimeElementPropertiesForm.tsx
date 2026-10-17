import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import {
	BufferTimeElementProperties,
	bufferTimeOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { formStyle } from '../commonStyles';
import { handleNumberInputChanged, handleOptionalNumberInputChanged } from '../utils';

export interface BufferTimeElementPropertiesFormProps {
	id: string;
	properties: BufferTimeElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function BufferTimeElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: BufferTimeElementPropertiesFormProps) {
	return (
		<Stack
			sx={{
				gap: formStyle.componentGap,
			}}
		>
			<TextField
				id="buffer-time-el-buffer-time-span-prop"
				label={bufferTimeOperatorDefinition.properties.bufferTimeSpan.label}
				value={properties.bufferTimeSpan}
				type="number"
				size="small"
				slotProps={{
					inputLabel: { shrink: true },
					htmlInput: { min: 0 },
				}}
				onChange={handleNumberInputChanged(
					id,
					'bufferTimeSpan',
					properties.bufferTimeSpan,
					onPropertyValueChange,
				)}
				helperText="The amount of time to fill each buffer array."
			/>

			<TextField
				id="buffer-time-el-buffer-creation-interval-prop"
				label={bufferTimeOperatorDefinition.properties.bufferCreationInterval.label}
				value={properties.bufferCreationInterval}
				type="number"
				size="small"
				defaultValue={null}
				slotProps={{
					inputLabel: { shrink: true },
					htmlInput: { min: 0 },
				}}
				onChange={handleOptionalNumberInputChanged(
					id,
					'bufferCreationInterval',
					properties.bufferCreationInterval,
					onPropertyValueChange,
				)}
				helperText="The interval at which to start new buffers."
			/>

			<TextField
				id="buffer-time-el-max-buffer-size-prop"
				label={bufferTimeOperatorDefinition.properties.maxBufferSize.label}
				value={properties.maxBufferSize}
				type="number"
				size="small"
				defaultValue={null}
				slotProps={{
					inputLabel: { shrink: true },
					htmlInput: { min: 0 },
				}}
				onChange={handleOptionalNumberInputChanged(
					id,
					'maxBufferSize',
					properties.maxBufferSize,
					onPropertyValueChange,
				)}
				helperText="The maximum buffer size."
			/>
		</Stack>
	);
}
