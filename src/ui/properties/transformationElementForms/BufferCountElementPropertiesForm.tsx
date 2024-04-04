import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { formStyle } from '../commonStyles';
import { BufferCountElementProperties } from '../../../model';
import { handleNumberInputChanged } from '../utils';

export interface BufferCountElementPropertiesFormProps {
	id: string;
	properties: BufferCountElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function BufferCountElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: BufferCountElementPropertiesFormProps) {
	return (
		<Stack gap={formStyle.componentGap}>
			<TextField
				id="buffer-count-el-buffer-size-prop"
				label="Buffer size"
				value={properties.bufferSize}
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
					'bufferSize',
					properties.bufferSize,
					onPropertyValueChange,
				)}
				helperText="The maximum size of the buffer emitted."
			/>

			<TextField
				id="buffer-count-el-start-buffer-every-prop"
				label="Start buffer every"
				value={properties.startBufferEvery}
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
					'startBufferEvery',
					properties.startBufferEvery,
					onPropertyValueChange,
				)}
				helperText="Interval at which to start a new buffer. For example if startBufferEvery is 2, then a new buffer will be started on every other value from the source. A new buffer is started at the beginning of the source by default."
			/>
		</Stack>
	);
}

