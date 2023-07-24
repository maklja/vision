import Konva from 'konva';
import { Stage } from 'react-konva';
import { useDrop } from 'react-dnd';
import { ConnectLinesLayer } from '../layers/connectLines';
import { DrawersLayer } from '../layers/drawers';
import { useAppDispatch } from '../store/rootState';
import { addDraftElement, clearDraftElement, useThemeContext } from '../store/stageSlice';
import { useStageHandlers } from './state';
import { DragNDropItem, DragNDropLayer } from '../layers/creation';
import { DragNDropType } from '../dragNDrop';
import { calculateShapeSizeBoundingBox } from '../theme';

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

	const [, drop] = useDrop<DragNDropItem>(
		() => ({
			accept: DragNDropType.CreateElement,
			drop({ element, shapeSize }, monitor) {
				if (!monitor.isOver()) {
					appDispatch(clearDraftElement());
					return;
				}

				const clientOffset = monitor.getClientOffset();
				const bb = calculateShapeSizeBoundingBox({ x: 0, y: 0 }, shapeSize);
				const xPosition = (clientOffset?.x ?? 0) - bb.width / 2;
				const yPosition = (clientOffset?.y ?? 0) - bb.height / 2;

				appDispatch(
					addDraftElement({
						...element,
						x: xPosition,
						y: yPosition,
					}),
				);
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
				<ConnectLinesLayer />
				<DrawersLayer />
				<DragNDropLayer />
			</Stage>
		</div>
	);
};

