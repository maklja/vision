import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { OperatorButton } from './OperatorButton';
import { ElementGroup, ElementType, mapElementGroupToTypes } from '../../model';

export interface OperatorPanelPopperProps {
	id: string;
	open: boolean;
	anchorEl: HTMLElement | null;
	elementGroup: ElementGroup | null;
}

export const OperatorPanelPopper = ({
	id,
	open,
	anchorEl,
	elementGroup,
}: OperatorPanelPopperProps) => {
	const elementTypes: ReadonlySet<ElementType> = elementGroup
		? mapElementGroupToTypes(elementGroup)
		: new Set();

	return (
		<Popper
			sx={{
				marginLeft: '10px !important',
				minHeight: '50px',
				width: '300px',
				opacity: open ? 1 : 0,
				visibility: open ? 'visible' : 'collapse',
				transition: 'visibility 300ms, opacity 300ms',
			}}
			id={id}
			open={Boolean(anchorEl)}
			anchorEl={anchorEl}
			placement="right-start"
		>
			<Paper>
				<Grid container sx={{ minHeight: '50px' }}>
					{[...elementTypes].sort().map((elType) => (
						<Grid
							item
							xs={4}
							key={elType}
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<OperatorButton elementType={elType} />
						</Grid>
					))}
				</Grid>
			</Paper>
		</Popper>
	);
};

