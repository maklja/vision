import Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Stage } from 'react-konva';
import { useDrop } from 'react-dnd';
import { AnimationsLayer } from '../layers/animations';
import { ConnectLinesLayer } from '../layers/connectLines';
import { DraftLayer, DragNDropItem, DragNDropLayer } from '../layers/creation';
import { DrawersLayer } from '../layers/drawers';
import { TooltipsLayer } from '../layers/tooltips';
import { useAppDispatch } from '../store/rootState';
import {
	addDraftElement,
	clearDraftElement,
	clearSnapLines,
	useThemeContext,
} from '../store/stageSlice';
import { useStageHandlers } from './state';
import { DragNDropType } from '../dragNDrop';
import { calculateShapeSizeBoundingBox } from '../theme';

Konva.hitOnDragEnabled = true;

export interface StageEvents {
	onMouseDown?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseUp?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onContextMenu?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseMove?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragStart?: (event: Konva.KonvaEventObject<DragEvent>) => void;
	onDragEnd?: (event: Konva.KonvaEventObject<DragEvent>) => void;
	onDragMove?: (event: Konva.KonvaEventObject<DragEvent>) => void;
	onWheel?: (event: Konva.KonvaEventObject<WheelEvent>) => void;
	onKeyUp?: (event: KeyboardEvent, stage: Konva.Stage | null) => void;
}

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
					appDispatch(clearSnapLines());
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
				appDispatch(clearSnapLines());
			},
		}),
		[],
	);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => stageHandlers.onKeyUp?.(e, stageRef.current);
		if (stageHandlers.onKeyUp) {
			window.addEventListener('keyup', handler, false);
		}

		return () => {
			if (stageHandlers.onKeyUp) {
				window.removeEventListener('keyup', handler, false);
			}
		};
	}, []);

	return (
		<div ref={drop}>
			<Stage
				{...stageHandlers}
				style={{ backgroundColor: theme.colors.backgroundPrimaryColor }}
				width={window.innerWidth}
				height={window.innerHeight}
				draggable={true}
				ref={stageRef}
			>
				<ConnectLinesLayer />
				<DrawersLayer />
				<AnimationsLayer />
				<DraftLayer />
				<TooltipsLayer />
				<DragNDropLayer />
			</Stage>
		</div>
	);
};
