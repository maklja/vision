import { PropsWithChildren, useState, MouseEvent } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import { TextField } from '@mui/material';

export enum InputType {
	Variable = 'variable',
	Custom = 'custom',
}

export interface CodeVariableInputProps {
	inputType: InputType;
}

export function CodeVariableInput({
	children,
	inputType,
}: PropsWithChildren<CodeVariableInputProps>) {
	const [currentInputType, setCurrentInputType] = useState(inputType);

	const handleInputTypeChange = (_event: MouseEvent<HTMLElement>, inputType: InputType) =>
		setCurrentInputType(inputType);

	return (
		<Stack direction="column" width="100%">
			<Paper
				sx={{
					p: '2px 0px 2px 4px',
					display: 'flex',
					alignItems: 'center',
					width: '100%',
				}}
			>
				<FormControl>
					<InputLabel variant="outlined" shrink={true} size="small">
						Text
					</InputLabel>
					<InputBase
						type="text"
						size="small"
						placeholder="Search Google Maps"
						inputProps={{ 'aria-label': 'search google maps' }}
					/>
				</FormControl>

				<TextField
					label="test"
					size="small"
					InputLabelProps={{
						shrink: true,
					}}
					InputProps={{
						components: {
							Input: InputBase,
						},
					}}
				/>

				{/* <Divider orientation="vertical" />
				<IconButton
					type="button"
					color={currentInputType === InputType.Custom ? 'primary' : 'default'}
					aria-label="Custom value"
					onClick={(e) => handleInputTypeChange(e, InputType.Custom)}
				>
					C
				</IconButton>
				<Divider orientation="vertical" />
				<IconButton
					type="button"
					color={currentInputType === InputType.Variable ? 'primary' : 'default'}
					aria-label="Variable"
					onClick={(e) => handleInputTypeChange(e, InputType.Variable)}
				>
					V
				</IconButton> */}
			</Paper>
			<FormHelperText>
				The interval size in milliseconds (by default) or the time unit determined by the
				scheduler{"'"}s clock.
			</FormHelperText>
		</Stack>
	);
}
