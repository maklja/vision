import TextField from '@mui/material/TextField';
import Stack from '@mui/system/Stack';

export interface ObservableNamedInputsProps {
	observableInputs: { id: string; connectLineName: string; targetElementName: string }[];
}

export const ObservableNamedInputs = ({ observableInputs }: ObservableNamedInputsProps) => {
	return (
		<Stack gap={1.2}>
			{observableInputs.map(({ id, connectLineName, targetElementName }) => (
				<Stack key={id} direction="row" gap={0.5}>
					<TextField
						label="Key"
						type="string"
						size="small"
						InputLabelProps={{
							shrink: true,
						}}
						value={connectLineName}
					/>

					<TextField
						label="Name"
						type="text"
						size="small"
						InputLabelProps={{
							shrink: true,
						}}
						InputProps={{
							readOnly: true,
						}}
						value={targetElementName}
					/>
				</Stack>
			))}
		</Stack>
	);
};
