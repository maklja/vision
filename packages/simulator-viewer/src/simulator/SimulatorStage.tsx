import Konva from 'konva';
import { useEffect, useRef, useState, forwardRef } from 'react';
import { Stage } from 'react-konva';
import { useDrop } from 'react-dnd';
import { useShallow } from 'zustand/react/shallow';
import { DraftLayer, DragNDropItem, DragNDropLayer } from '../layers/creation';
import { DrawersLayer } from '../layers/drawers';
import { useStageHandlers } from './state';
import { DragNDropType } from '../dragNDrop';
import { GridLayer } from '../layers/grid';
import { StageState, selectStageState } from '../store/stage';
import { useRootStore } from '../store/rootStore';
import { useThemeContext } from '../store/hooks';

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
	onKeyDown?: (event: KeyboardEvent, stage: Konva.Stage | null) => void;
	onKeyUp?: (event: KeyboardEvent, stage: Konva.Stage | null) => void;
}

export const SimulatorStage = forwardRef<Konva.Stage | null, unknown>(
	function SimulatorStage(_props, parentStageRef) {
		const theme = useThemeContext();
		const addDraftElement = useRootStore((state) => state.addDraftElement);
		const stopElementDraw = useRootStore((state) => state.stopElementDraw);
		const clearSnapLines = useRootStore((state) => state.clearSnapLines);
		const updateCanvasState = useRootStore((state) => state.updateCanvasState);
		const canvasState = useRootStore(useShallow((state) => state.canvasState));
		const stageState = useRootStore(selectStageState());
		const stageHandlers = useStageHandlers();
		const stageRef = useRef<Konva.Stage | null>(null);
		// small workaround because react=dnd doesn't support key events
		const [snapToGrid, setSnapToGrid] = useState(false);

		const [, drop] = useDrop<DragNDropItem>(
			() => ({
				accept: DragNDropType.CreateElement,
				drop(_data, monitor) {
					if (!monitor.isOver()) {
						stopElementDraw();
						clearSnapLines();
						return;
					}

					if (!stageRef.current) {
						return;
					}

					addDraftElement();
					clearSnapLines();
				},
			}),
			[],
		);

		useEffect(() => {
			const keyDownHandler = (e: KeyboardEvent) =>
				stageHandlers.onKeyDown?.(e, stageRef.current);
			const keyUpHandler = (e: KeyboardEvent) => stageHandlers.onKeyUp?.(e, stageRef.current);
			const dragHandler = (e: DragEvent) => setSnapToGrid(e.shiftKey);
			const resizeHandler = () =>
				updateCanvasState({
					width: window.innerWidth,
					height: window.innerHeight,
				});

			window.addEventListener('keydown', keyDownHandler, false);
			window.addEventListener('keyup', keyUpHandler, false);
			window.addEventListener('drag', dragHandler, false);
			window.addEventListener('resize', resizeHandler, false);

			return () => {
				window.removeEventListener('keydown', keyDownHandler, false);
				window.removeEventListener('keyup', keyUpHandler, false);
				window.removeEventListener('drag', dragHandler, false);
				window.removeEventListener('resize', resizeHandler, false);
			};
		}, [stageHandlers]);

		useEffect(() => {
			if (!stageRef.current) {
				return;
			}

			updateCanvasState({
				x: stageRef.current.position().x,
				y: stageRef.current.position().y,
				width: stageRef.current.width(),
				height: stageRef.current.height(),
				scaleX: stageRef.current.scaleX(),
				scaleY: stageRef.current.scaleY(),
			});
		}, [stageRef.current]);

		function handleStageRef(stage: Konva.Stage) {
			stageRef.current = stage;
			if (!parentStageRef) {
				return;
			}

			if (typeof parentStageRef === 'function') {
				parentStageRef(stage);
			} else {
				parentStageRef.current = stage;
			}
		}

		return (
			<div ref={drop}>
				<Stage
					{...stageHandlers}
					style={{ backgroundColor: theme.colors.backgroundPrimaryColor }}
					width={window.innerWidth}
					height={window.innerHeight}
					draggable={stageState === StageState.Select}
					ref={handleStageRef}
					x={canvasState.x}
					y={canvasState.y}
					scaleX={canvasState.scaleX}
					scaleY={canvasState.scaleY}
				>
					{stageRef.current ? <GridLayer stage={stageRef.current} /> : null}
					<DrawersLayer />
					<DraftLayer />
					<DragNDropLayer snapToGrid={snapToGrid} />
				</Stage>
			</div>
		);
	},
);

