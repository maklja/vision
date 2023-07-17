import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import PhoneIcon from '@mui/icons-material/Phone';
import {
	CreationOperatorIcon,
	FilteringOperatorIcon,
	JoinCreationOperatorIcon,
	SubscriberOperatorIcon,
} from './icons';
import { useDrag } from 'react-dnd';
import { ElementGroup } from '../model';
import { OperatorPanelPopper } from './poppers';

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

export const OperatorsPanel = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [elementGroup, setElementGroup] = useState<null | ElementGroup>(null);

	const onElementGroupChanged = (
		event: React.MouseEvent<HTMLElement>,
		newElementGroup: ElementGroup,
	) => {
		if (newElementGroup === elementGroup) {
			setElementGroup(null);
			setAnchorEl(null);
			return;
		}

		setElementGroup(newElementGroup);
		setAnchorEl(event.currentTarget);
	};

	return (
		<div>
			<Paper>
				<Stack aria-label="RxJS operator types">
					<IconButton
						aria-label="creation operators"
						title="Creation operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Creation)}
					>
						<CreationOperatorIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="join creation operators"
						title="Join creation operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.JoinCreation)}
					>
						<JoinCreationOperatorIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="transformation operators"
						title="Transformation operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Transformation)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="filtering operators"
						title="Filtering operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Filtering)}
					>
						<FilteringOperatorIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="join operators"
						title="Join operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Join)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="multicasting operators"
						title="Multicasting operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Multicasting)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="error handling operators"
						title="Error handling operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.ErrorHandling)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="utility operators"
						title="Utility operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Utility)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="conditional and boolean operators"
						title="Conditional and Boolean operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Conditional)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="mathematical and aggregate operators"
						title="Mathematical and Aggregate operators"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Mathematical)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="subscriber"
						title="Subscriber"
						size="large"
						color="primary"
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Subscriber)}
					>
						<SubscriberOperatorIcon fontSize="inherit" />
					</IconButton>
				</Stack>
			</Paper>

			<OperatorPanelPopper
				id="operators-popper"
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				elementGroup={elementGroup}
			/>
		</div>
	);
};
