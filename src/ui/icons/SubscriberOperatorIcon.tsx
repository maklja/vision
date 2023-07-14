import { SvgIconProps } from '@mui/material/SvgIcon';
import { SvgIcon } from './SvgIcon';

export const SubscriberOperatorIcon = (props: SvgIconProps) => {
	return (
		<SvgIcon {...props}>
			<g transform="translate(4 4)">
				<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14z" />
			</g>

			<g transform="scale(0.7 0.7) translate(9 9) ">
				<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14z" />
			</g>
		</SvgIcon>
	);
};

