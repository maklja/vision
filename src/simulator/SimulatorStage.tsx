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
import { useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';

Konva.hitOnDragEnabled = true;

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

const MIDDLE_MOUSE_BUTTON_KEY = 4;

export const SimulatorStage = () => {
	const theme = useThemeContext();
	const stageHandlers = useStageHandlers();
	const appDispatch = useAppDispatch();
	const stageRef = useRef<Konva.Stage | null>(null);

	const [, drop] = useDrop<DragNDropItem>(
		() => ({
			accept: DragNDropType.CreateElement,
			drop({ element, shapeSize }, monitor) {
				if (!monitor.isOver()) {
					appDispatch(clearDraftElement());
					return;
				}

				if (!stageRef.current) {
					return;
				}

				const position = stageRef.current.getPosition();
				const clientOffset = monitor.getClientOffset();
				const bb = calculateShapeSizeBoundingBox({ x: 0, y: 0 }, shapeSize);
				const xPosition = (clientOffset?.x ?? 0) - position.x - bb.width / 2;
				const yPosition = (clientOffset?.y ?? 0) - position.y - bb.height / 2;

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

	const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
		if (!stageRef.current) {
			return;
		}

		const { button, buttons } = e.evt;
		if (button !== MIDDLE_MOUSE_BUTTON_KEY && buttons !== MIDDLE_MOUSE_BUTTON_KEY) {
			stageRef.current.stopDrag();
		}
	};

	return (
		<div ref={drop}>
			<Stage
				{...stageHandlers}
				style={{ backgroundColor: theme.colors.backgroundColor }}
				width={window.innerWidth}
				height={window.innerHeight}
				draggable={true}
				ref={stageRef}
				onDragStart={handleDragStart}
			>
				<ConnectLinesLayer />
				<DrawersLayer />
				<DragNDropLayer />
			</Stage>
		</div>
	);
};

