import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Divider from '@mui/material/Divider';

export interface ZoomControlsProps {
	onZoomIn?: () => void;
	onZoomOut?: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
	return (
		<Paper
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				width: '100%',
				height: '100%',
			}}
		>
			<IconButton
				aria-label="zoom in"
				color="primary"
				title="Zoom in"
				size="medium"
				onClick={() => onZoomIn?.()}
			>
				<AddIcon fontSize="medium" />
			</IconButton>
			<Divider
				orientation="horizontal"
				variant="fullWidth"
				flexItem
				aria-hidden="true"
				sx={{ borderBottomWidth: 2 }}
			/>
			<IconButton
				aria-label="zoom out"
				color="primary"
				title="Zoom out"
				size="medium"
				onClick={() => onZoomOut?.()}
			>
				<RemoveIcon fontSize="medium" />
			</IconButton>
		</Paper>
	);
}

