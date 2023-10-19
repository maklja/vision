import { useMemo } from 'react';
import { Layer, Line } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { selectCanvasState } from '../../store/canvas';
import { useThemeContext } from '../../store/stageSlice';
import { useGridTheme } from '../../theme';

export const GridLayer = () => {
	const theme = useThemeContext();
	const gridTheme = useGridTheme(theme);
	const { x, y, width, height, scaleX } = useAppSelector(selectCanvasState);

	const { viewRect, gridLines } = useMemo(() => {
		const gridSize = gridTheme.size;
		const stageRect = {
			x1: 0,
			y1: 0,
			x2: width,
			y2: height,
			offset: {
				x: x / scaleX,
				y: y / scaleX,
			},
		};
		// make a rect to describe the viewport
		const viewRect = {
			x1: -stageRect.offset.x,
			y1: -stageRect.offset.y,
			x2: width / scaleX - stageRect.offset.x,
			y2: height / scaleX - stageRect.offset.y,
		};
		// and find the largest rectangle that bounds both the stage and view rect.
		// This is the rect we will draw on.
		const gridOffset = {
			x: Math.ceil(x / scaleX / gridSize) * gridSize,
			y: Math.ceil(y / scaleX / gridSize) * gridSize,
		};
		const gridRect = {
			x1: -gridOffset.x,
			y1: -gridOffset.y,
			x2: width / scaleX - gridOffset.x + gridSize,
			y2: height / scaleX - gridOffset.y + gridSize,
		};
		const fullRect = {
			x1: Math.min(stageRect.x1, gridRect.x1),
			y1: Math.min(stageRect.y1, gridRect.y1),
			x2: Math.max(stageRect.x2, gridRect.x2),
			y2: Math.max(stageRect.y2, gridRect.y2),
		};
		// find the x & y size of the grid
		const xSize = fullRect.x2 - fullRect.x1;
		const ySize = fullRect.y2 - fullRect.y1;
		// compute the number of steps required on each axis.
		const xSteps = Math.round(xSize / gridSize);
		const ySteps = Math.round(ySize / gridSize);

		const gridLines = [];
		// draw vertical lines
		for (let i = 0; i <= xSteps; i++) {
			gridLines.push(
				<Line
					key={`v${i}`}
					x={fullRect.x1 + i * gridSize}
					y={fullRect.y1}
					points={[0, 0, 0, ySize]}
					stroke={gridTheme.stroke}
					strokeWidth={gridTheme.strokeWidth}
				/>,
			);
		}
		//draw Horizontal lines
		for (let i = 0; i <= ySteps; i++) {
			gridLines.push(
				<Line
					key={`h${i}`}
					x={fullRect.x1}
					y={fullRect.y1 + i * gridSize}
					points={[0, 0, xSize, 0]}
					stroke={gridTheme.stroke}
					strokeWidth={gridTheme.strokeWidth}
				/>,
			);
		}

		return {
			viewRect,
			gridLines,
		};
	}, [x, y, width, height, scaleX, gridTheme.size]);

	return (
		<Layer
			clipX={viewRect.x1}
			clipY={viewRect.y1}
			width={viewRect.x2 - viewRect.x1}
			height={viewRect.y2 - viewRect.y1}
			draggable={false}
		>
			{gridLines}
		</Layer>
	);
};

