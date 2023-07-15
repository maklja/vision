import { Layer, Stage } from 'react-konva';
import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';

export const OperatorButton = ({ children }: PropsWithChildren<unknown>) => {
	return (
		<Box>
			<Stage width={80} height={80}>
				<Layer>{children}</Layer>
			</Stage>
		</Box>
	);
};

