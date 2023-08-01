import MuiSvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { styled } from '@mui/material/styles';

export const SvgIcon = styled(MuiSvgIcon)<SvgIconProps>(() => ({
	fill: 'none',
	stroke: 'currentColor',
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
	strokeWidth: '2.25px',
}));

