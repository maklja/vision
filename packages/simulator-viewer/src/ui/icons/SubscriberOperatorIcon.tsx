import { SvgIconProps } from '@mui/material/SvgIcon';
import { SvgIcon } from './SvgIcon';

export const SubscriberOperatorIcon = (props: SvgIconProps) => {
	return (
		<SvgIcon {...props}>
			<g strokeWidth={1.25} transform="scale(1.3 1.3) translate(1.5 1.5)">
				<g>
					<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14z" />
				</g>

				<g
					fill="currentColor"
					stroke="none"
					transform="scale(0.65 0.65) translate(4.2 4.2)"
				>
					<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14z" />
				</g>
			</g>
		</SvgIcon>
	);
};

