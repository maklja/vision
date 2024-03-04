import { PropsWithChildren, useState, ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import { WindowPlaceholder } from './WindowPlaceholder';

export interface WindowShellProps {
	icon: ReactNode;
	title: string;
	tooltip?: string;
	sx?: SxProps<Theme>;
	showControlButtons?: boolean;
	onClose?: () => void;
}

export interface WindowShellContentProps extends WindowShellProps {
	onMinimizeClick?: () => void;
}

function WindowShellContent({
	icon,
	title,
	tooltip,
	children,
	showControlButtons = true,
	onMinimizeClick,
}: PropsWithChildren<WindowShellContentProps>) {
	return (
		<>
			{showControlButtons && (
				<Box display="flex" flexDirection="row" justifyContent="end">
					<ButtonGroup
						variant="contained"
						aria-label="Window controls"
						disableElevation
						size="small"
					>
						<Button
							size="small"
							aria-label="Minimize"
							color="info"
							onClick={onMinimizeClick}
						>
							<MinimizeIcon fontSize="small" />
						</Button>
						<Button size="small" aria-label="Close" color="error">
							<CloseIcon fontSize="small" />
						</Button>
					</ButtonGroup>
				</Box>
			)}
			<Paper
				elevation={1}
				sx={{
					margin: '1px 0',
					borderBottomLeftRadius: '0px',
					borderBottomRightRadius: '0px',
				}}
			>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					sx={{
						padding: '5px 10px',
					}}
					gap={1}
				>
					{icon}
					<Typography
						variant="h6"
						component="div"
						sx={{
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
						}}
						title={tooltip}
					>
						{title}
					</Typography>
				</Box>
			</Paper>

			{children}
		</>
	);
}

export function WindowShell(windowShellProps: PropsWithChildren<WindowShellProps>) {
	const [minimized, setMinimized] = useState(false);

	return (
		<Box sx={windowShellProps.sx}>
			{minimized ? (
				<WindowPlaceholder {...windowShellProps} onClick={() => setMinimized(false)} />
			) : (
				<WindowShellContent
					{...windowShellProps}
					onMinimizeClick={() => setMinimized(true)}
				/>
			)}
		</Box>
	);
}

