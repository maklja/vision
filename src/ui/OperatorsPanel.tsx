import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhoneIcon from '@mui/icons-material/Phone';
import {
	CreationOperatorIcon,
	FilteringOperatorIcon,
	JoinCreationOperatorIcon,
	SubscriberOperatorIcon,
} from './icons';
import { useDrag } from 'react-dnd';
import { OperatorButton } from './buttons/OperatorButton';
import { CreationOperatorButton } from './buttons/CreationOperatorButton';
import { ElementType, creationOperators } from '../model';

interface OperatorPanelPopperProps {
	id: string;
	open: boolean;
	anchorEl: HTMLElement | null;
}

const XXX = () => {
	const [{ opacity }, dragRef] = useDrag(
		() => ({
			type: 'test',
			item: { text: 'test' },
			collect: (monitor) => ({
				opacity: monitor.isDragging() ? 0.5 : 1,
			}),
		}),
		[],
	);

	return (
		<div ref={dragRef}>
			<Button sx={{ opacity }} variant="outlined">
				Primary
			</Button>
		</div>
	);
};

const OperatorPanelPopper = ({ id, open, anchorEl }: OperatorPanelPopperProps) => {
	return (
		<Popper
			sx={{ marginLeft: '10px !important' }}
			id={id}
			open={open}
			anchorEl={anchorEl}
			placement="right-start"
		>
			<Box>
				<Paper>
					{[...creationOperators].map((elType) => (
						<CreationOperatorButton key={elType} elementType={elType} />
					))}

					<OperatorButton />
					<OperatorButton />
				</Paper>
			</Box>
		</Popper>
	);
};

export const OperatorsPanel = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	return (
		<Box>
			<Paper>
				<Stack aria-label="RxJS operator types">
					<IconButton
						aria-label="creation operators"
						title="Creation operators"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<CreationOperatorIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="join creation operators"
						title="Join creation operators"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<JoinCreationOperatorIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="transformation operators"
						title="Transformation operators"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="filtering operators"
						title="Filtering operators"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<FilteringOperatorIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="join operators"
						title="Join operators"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="multicasting operators"
						title="Multicasting operators"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="utility operators"
						title="Utility operators"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="conditional and boolean operators"
						title="Conditional and Boolean operators"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="mathematical and aggregate operators"
						title="Mathematical and Aggregate operators"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="subscriber"
						title="Subscriber"
						size="large"
						color="primary"
						onClick={handleClick}
					>
						<SubscriberOperatorIcon fontSize="inherit" />
					</IconButton>
				</Stack>
			</Paper>

			<OperatorPanelPopper
				id="operators-popper"
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
			/>
		</Box>
	);
};

