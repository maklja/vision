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
				const scale = stageRef.current.scale() ?? { x: 1, y: 1 };

				const clientOffset = monitor.getClientOffset();
				const bb = calculateShapeSizeBoundingBox({ x: 0, y: 0 }, shapeSize);
				const xPosition = ((clientOffset?.x ?? 0) - position.x) / scale.x - bb.width / 2;
				const yPosition = ((clientOffset?.y ?? 0) - position.y) / scale.y - bb.height / 2;

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

	const scaleBy = 2.01;
	const handleMouseWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();

		if (!stageRef.current) {
			return;
		}

		const stage = stageRef.current;

		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();

		const pointerX = pointer?.x ?? 0;
		const pointerY = pointer?.y ?? 0;

		const mousePointTo = {
			x: (pointerX - stage.x()) / oldScale,
			y: (pointerY - stage.y()) / oldScale,
		};

		let direction = e.evt.deltaY > 0 ? 1 : -1;
		if (e.evt.ctrlKey) {
			direction = -direction;
		}

		const unboundedNewScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
		let newScale = unboundedNewScale;
		if (unboundedNewScale < 0.1) {
			newScale = 0.1;
		} else if (unboundedNewScale > 10.0) {
			newScale = 10.0;
		}

		stage.scale({ x: newScale, y: newScale });

		stage.position({
			x: pointerX - mousePointTo.x * newScale,
			y: pointerY - mousePointTo.y * newScale,
		});
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
				onWheel={handleMouseWheel}
			>
				<ConnectLinesLayer />
				<DrawersLayer />
				<DragNDropLayer />
			</Stage>
		</div>
	);
};

