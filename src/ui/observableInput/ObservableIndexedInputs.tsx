import TextField from '@mui/material/TextField';
import Stack from '@mui/system/Stack';

export interface ObservableIndexedInputsProps {
	observableInputs: { id: string; index: number; name: string }[];
}

export const ObservableIndexedInputs = ({ observableInputs }: ObservableIndexedInputsProps) => {
	return (
		<Stack gap={1.2}>
			{observableInputs.map(({ id, index, name }) => (
				<Stack key={id} direction="row" gap={0.5}>
					<TextField
						sx={{ flex: '1 1 0' }}
						label="Index"
						type="number"
						size="small"
						InputLabelProps={{
							shrink: true,
						}}
						inputProps={{ style: { textAlign: 'center' } }}
						value={index}
					/>

					<TextField
						sx={{ flex: '4 1 0' }}
						label="Name"
						type="text"
						size="small"
						InputLabelProps={{
							shrink: true,
						}}
						InputProps={{
							readOnly: true,
						}}
						value={name}
					/>
				</Stack>
			))}
		</Stack>
	);
};
