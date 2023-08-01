import { useState, MouseEvent, PropsWithChildren } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import PhoneIcon from '@mui/icons-material/Phone';
import {
	CreationOperatorIcon,
	FilteringOperatorIcon,
	JoinCreationOperatorIcon,
	SubscriberOperatorIcon,
} from './icons';
import { ElementGroup } from '../model';
import { OperatorPanelPopper } from './poppers';
import { useTheme } from '@mui/material/styles';

interface SelectableOperatorButtonProps {
	ariaLabel: string;
	title: string;
	selected: boolean;
	disabled: boolean;
	onClick: (e: MouseEvent<HTMLElement>) => void;
}

const SelectableOperatorButton = ({
	ariaLabel,
	title,
	selected,
	disabled,
	onClick,
	children,
}: PropsWithChildren<SelectableOperatorButtonProps>) => {
	const theme = useTheme();

	const borderStyle = '2px solid';
	return (
		<Stack
			sx={{
				borderRight: selected
					? `${borderStyle} ${theme.palette.primary.main}`
					: `${borderStyle} transparent`,
			}}
		>
			<IconButton
				aria-label={ariaLabel}
				title={title}
				size="large"
				color="primary"
				disabled={disabled}
				onClick={onClick}
			>
				{children}
			</IconButton>
		</Stack>
	);
};

export interface OperatorsPanelProps {
	popperVisible?: boolean;
	disabled?: boolean;
}

export const OperatorsPanel = ({ popperVisible = true, disabled = false }: OperatorsPanelProps) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [elementGroup, setElementGroup] = useState<null | ElementGroup>(null);

	const onElementGroupChanged = (
		event: MouseEvent<HTMLElement>,
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
					<SelectableOperatorButton
						ariaLabel="creation operators"
						title="Creation operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Creation)}
						selected={elementGroup === ElementGroup.Creation}
					>
						<CreationOperatorIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<SelectableOperatorButton
						ariaLabel="join creation operators"
						title="Join creation operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.JoinCreation)}
						selected={elementGroup === ElementGroup.JoinCreation}
					>
						<JoinCreationOperatorIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<IconButton
						aria-label="transformation operators"
						title="Transformation operators"
						size="large"
						color="primary"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Transformation)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="filtering operators"
						title="Filtering operators"
						size="large"
						color="primary"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Filtering)}
					>
						<FilteringOperatorIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="join operators"
						title="Join operators"
						size="large"
						color="primary"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Join)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="multicasting operators"
						title="Multicasting operators"
						size="large"
						color="primary"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Multicasting)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="error handling operators"
						title="Error handling operators"
						size="large"
						color="primary"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.ErrorHandling)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="utility operators"
						title="Utility operators"
						size="large"
						color="primary"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Utility)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="conditional and boolean operators"
						title="Conditional and Boolean operators"
						size="large"
						color="primary"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Conditional)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="mathematical and aggregate operators"
						title="Mathematical and Aggregate operators"
						size="large"
						color="primary"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Mathematical)}
					>
						<PhoneIcon fontSize="inherit" />
					</IconButton>

					<IconButton
						aria-label="subscriber"
						title="Subscriber"
						size="large"
						color="primary"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Subscriber)}
					>
						<SubscriberOperatorIcon fontSize="inherit" />
					</IconButton>
				</Stack>
			</Paper>

			<OperatorPanelPopper
				id="operators-popper"
				open={popperVisible && Boolean(anchorEl)}
				anchorEl={anchorEl}
				elementGroup={elementGroup}
			/>
		</div>
	);
};
