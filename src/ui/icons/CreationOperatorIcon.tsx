import { SvgIconProps } from '@mui/material/SvgIcon';
import { SvgIcon } from './SvgIcon';

export const CreationOperatorIcon = (props: SvgIconProps) => {
	return (
		<SvgIcon {...props}>
			<g transform="translate(1 1) scale(1.4 1.4)">
				<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14z" />
			</g>
		</SvgIcon>
	);
};

