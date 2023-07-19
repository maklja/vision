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
			sx={{ marginLeft: '10px !important', width: '300px' }}
			id={id}
			open={open}
			anchorEl={anchorEl}
			placement="right-start"
		>
			<Paper>
				<Grid container>
					{[...elementTypes].map((elType) => (
						<Grid
							item
							xs={4}
							key={elType}
							sx={{ display: 'flex', justifyContent: 'center' }}
						>
							<OperatorButton elementType={elType} />
						</Grid>
					))}
				</Grid>
			</Paper>
		</Popper>
	);
};
