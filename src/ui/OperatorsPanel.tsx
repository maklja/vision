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

					<SelectableOperatorButton
						ariaLabel="transformation operators"
						title="Transformation operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Transformation)}
						selected={elementGroup === ElementGroup.Transformation}
					>
						<PhoneIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<SelectableOperatorButton
						ariaLabel="filtering operators"
						title="Filtering operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Filtering)}
						selected={elementGroup === ElementGroup.Filtering}
					>
						<FilteringOperatorIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<SelectableOperatorButton
						ariaLabel="join operators"
						title="Join operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Join)}
						selected={elementGroup === ElementGroup.Join}
					>
						<PhoneIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<SelectableOperatorButton
						ariaLabel="multicasting operators"
						title="Multicasting operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Multicasting)}
						selected={elementGroup === ElementGroup.Multicasting}
					>
						<PhoneIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<SelectableOperatorButton
						ariaLabel="error handling operators"
						title="Error handling operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.ErrorHandling)}
						selected={elementGroup === ElementGroup.ErrorHandling}
					>
						<PhoneIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<SelectableOperatorButton
						ariaLabel="utility operators"
						title="Utility operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Utility)}
						selected={elementGroup === ElementGroup.Utility}
					>
						<PhoneIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<SelectableOperatorButton
						ariaLabel="conditional and boolean operators"
						title="Conditional and Boolean operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Conditional)}
						selected={elementGroup === ElementGroup.Conditional}
					>
						<PhoneIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<SelectableOperatorButton
						ariaLabel="mathematical and aggregate operators"
						title="Mathematical and Aggregate operators"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Mathematical)}
						selected={elementGroup === ElementGroup.Mathematical}
					>
						<PhoneIcon fontSize="inherit" />
					</SelectableOperatorButton>

					<SelectableOperatorButton
						ariaLabel="subscriber"
						title="Subscriber"
						disabled={disabled}
						onClick={(e) => onElementGroupChanged(e, ElementGroup.Subscriber)}
						selected={elementGroup === ElementGroup.Subscriber}
					>
						<SubscriberOperatorIcon fontSize="inherit" />
					</SelectableOperatorButton>
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

