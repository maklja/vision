import { ChangeEvent } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

export interface ObservableIndexedInputsProps {
	observableInputs: { id: string; index: number; name: string }[];
	onConnectLineIndexChange?: (id: string, connectLineIndex: number) => void;
}

export const ObservableIndexedInputs = ({
	observableInputs,
	onConnectLineIndexChange,
}: ObservableIndexedInputsProps) => {
	const handleConnectLineIndexChanged = (
		id: string,
		currentIndex: number,
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const newIndexValue = Number(e.target.value);
		onConnectLineIndexChange?.(id, isNaN(newIndexValue) ? currentIndex : newIndexValue);
	};

	return (
		<Stack gap={1.2}>
			{observableInputs.length > 0 ? (
				observableInputs.map(({ id, index, name }) => (
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
							onChange={(e) => handleConnectLineIndexChanged(id, index, e)}
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
				))
			) : (
				<Stack alignItems="center">No observable inputs</Stack>
			)}
		</Stack>
	);
};
