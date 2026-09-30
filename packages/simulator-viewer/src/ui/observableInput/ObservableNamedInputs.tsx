import { ChangeEvent } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

export interface ObservableNamedInputsProps {
	observableInputs: { id: string; connectLineName: string; targetElementName: string }[];
	onConnectLineNameChange?: (id: string, connectLineName: string) => void;
}

export const ObservableNamedInputs = ({
	observableInputs,
	onConnectLineNameChange,
}: ObservableNamedInputsProps) => {
	const handleConnectLineKeyChange = (
		id: string,
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => onConnectLineNameChange?.(id, e.currentTarget.value);

	return (
		<Stack
			sx={{
				gap: 1.2,
			}}
		>
			{observableInputs.length > 0 ? (
				observableInputs.map(({ id, connectLineName, targetElementName }) => (
					<Stack
						key={id}
						direction="row"
						sx={{
							gap: 0.5,
						}}
					>
						<TextField
							label="Key"
							type="string"
							size="small"
							slotProps={{
								inputLabel: { shrink: true },
							}}
							value={connectLineName}
							onChange={(e) => handleConnectLineKeyChange(id, e)}
						/>

						<TextField
							label="Name"
							type="text"
							size="small"
							slotProps={{
								inputLabel: { shrink: true },
								input: { readOnly: true },
							}}
							value={targetElementName}
						/>
					</Stack>
				))
			) : (
				<Stack
					sx={{
						alignItems: 'center',
					}}
				>
					No observable inputs
				</Stack>
			)}
		</Stack>
	);
};
