import Konva from 'konva';
import Box from '@mui/material/Box';
import { ZoomControls } from '../ui';
import { ZoomType } from '../store/stage';
import { zoomStage } from './state';
import { useRootStore } from '../store/rootStore';

export interface SimulatorZoomProps {
	stage: Konva.Stage | null;
}

export function SimulatorZoom({ stage }: SimulatorZoomProps) {
	const updateCanvasState = useRootStore((state) => state.updateCanvasState);

	function handleZoom(zoomType: ZoomType) {
		if (!stage) {
			return;
		}

		zoomStage(stage, zoomType);

		updateCanvasState({
			x: stage.position().x,
			y: stage.position().y,
			width: stage.width(),
			height: stage.height(),
			scaleX: stage.scaleX(),
			scaleY: stage.scaleY(),
		});
	}

	return (
		<Box
			sx={{
				position: 'absolute',
				bottom: '2%',
				left: '2px',
				width: '40px',
			}}
		>
			<ZoomControls
				onZoomIn={() => handleZoom(ZoomType.In)}
				onZoomOut={() => handleZoom(ZoomType.Out)}
			/>
		</Box>
	);
}

