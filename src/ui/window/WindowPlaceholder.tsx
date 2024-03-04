import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { ReactNode } from 'react';

export interface WindowPlaceholderProps {
	icon: ReactNode;
	tooltip?: string;
	onClick?: () => void;
}

export function WindowPlaceholder({ icon, tooltip, onClick }: WindowPlaceholderProps) {
	return (
		<Paper
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
				padding: '2px',
			}}
		>
			<ButtonGroup
				variant="contained"
				aria-label={tooltip}
				disableElevation
				size="small"
				title={tooltip}
				orientation="vertical"
			>
				<Button size="large" aria-label={tooltip} color="info" onClick={onClick}>
					{icon}
				</Button>
			</ButtonGroup>
		</Paper>
	);
}

