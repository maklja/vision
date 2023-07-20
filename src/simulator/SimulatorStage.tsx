import Konva from 'konva';
import { Layer, Stage } from 'react-konva';
import { useDrop } from 'react-dnd';
import { ConnectLinesLayer } from '../layers/connectLines';
import { DrawersLayer } from '../layers/drawers';
import { useAppDispatch } from '../store/rootState';
import { useThemeContext } from '../store/stageSlice';
import { Element } from '../model';
import { useStageHandlers } from './state';
import { CreationLayer } from '../layers/creation';
import { DragNDropType } from '../dragNDrop';

export interface StageEvents {
	onMouseDown?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseUp?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseMove?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragStart?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragEnd?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragMove?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const SimulatorStage = () => {
	const theme = useThemeContext();
	const stageHandlers = useStageHandlers();
	const appDispatch = useAppDispatch();

	const [, drop] = useDrop<Element>(
		() => ({
			accept: DragNDropType.CreateElement,
			drop(item, monitor) {
				console.log('drop', item);
				// return { test: 'test' };
			},
		}),
		[],
	);

	return (
		<div ref={drop}>
			<Stage
				{...stageHandlers}
				style={{ backgroundColor: theme.colors.backgroundColor }}
				width={window.innerWidth}
				height={window.innerHeight}
			>
				<Layer>
					<ConnectLinesLayer />
					<DrawersLayer />
				</Layer>
				<CreationLayer />
			</Stage>
		</div>
	);
};
