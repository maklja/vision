import { ChangeEvent } from 'react';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

export interface KeyValueListProps {
	label: string;
	data: readonly [string, string][];
	onChange?: (data: [string, string][]) => void;
}

export const KeyValueList = ({ label, data, onChange }: KeyValueListProps) => {
	const handleAddClick = () => onChange?.([...data, ['', '']]);

	const handleRemoveClick = (index: number) => onChange?.(data.filter((_, i) => i !== index));

	const handleKeyChanged = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		index: number,
	) => onChange?.(data.map((pair, i) => (i !== index ? pair : [e.currentTarget.value, pair[1]])));

	const handleValueChanged = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		index: number,
	) => onChange?.(data.map((pair, i) => (i !== index ? pair : [pair[0], e.currentTarget.value])));

	return (
		<Stack gap={0.5}>
			<InputLabel shrink>{label}</InputLabel>

			<Stack gap={1.2}>
				{data.map(([key, value], i) => (
					<Stack key={i} direction="row" gap={0.5}>
						<TextField
							label="Key"
							type="text"
							size="small"
							InputLabelProps={{
								shrink: true,
							}}
							value={key}
							onChange={(e) => handleKeyChanged(e, i)}
						/>

						<TextField
							label="Value"
							type="text"
							size="small"
							InputLabelProps={{
								shrink: true,
							}}
							value={value}
							onChange={(e) => handleValueChanged(e, i)}
						/>

						<IconButton color="error" onClick={() => handleRemoveClick(i)}>
							<RemoveCircleIcon />
						</IconButton>
					</Stack>
				))}
				<Stack direction="row" gap={0.5}>
					<TextField
						label="Key"
						type="text"
						size="small"
						InputLabelProps={{
							shrink: true,
						}}
						disabled
					/>

					<TextField
						label="Value"
						type="text"
						size="small"
						InputLabelProps={{
							shrink: true,
						}}
						disabled
					/>

					<IconButton color="primary" onClick={handleAddClick}>
						<AddCircleIcon />
					</IconButton>
				</Stack>
			</Stack>
		</Stack>
	);
};

