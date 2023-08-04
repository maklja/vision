import { SvgIconProps } from '@mui/material/SvgIcon';
import { SvgIcon } from './SvgIcon';

export const TransformationOperatorIcon = (props: SvgIconProps) => {
	return (
		<SvgIcon {...props}>
			<g strokeWidth={1.25} transform="translate(1.5 3) scale(1 1.3)">
				<path d="M 1.765625 1.171875 C -0.109375 4.945312 -0.109375 11.90625 1.765625 15.386719 " />
				<path d="M 19.9375 15.386719 C 21.820312 11.90625 21.820312 4.945312 19.9375 1.171875 " />
				<path d="M 2.972656 1.171875 C 4.855469 4.945312 4.855469 11.90625 2.972656 15.386719 L 18.734375 15.386719 C 16.847656 11.90625 16.847656 4.945312 18.734375 1.171875 Z" />
			</g>
		</SvgIcon>
	);
};

