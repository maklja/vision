import Konva from 'konva';
import {
	useEffect,
	useRef,
	useState,
	forwardRef,
} from 'react';
import { Stage } from 'react-konva';
import { useDrop } from 'react-dnd';
import { AnimationsLayer } from '../layers/animations';
import { DraftLayer, DragNDropItem, DragNDropLayer } from '../layers/creation';
import { DrawersLayer } from '../layers/drawers';
import { useAppDispatch } from '../store/rootState';
import {
	addDraftElement,
	clearDraftElement,
	clearSnapLines,
	updateCanvasState,
	useThemeContext,
} from '../store/stageSlice';
import { useStageHandlers } from './state';
import { DragNDropType } from '../dragNDrop';
import { GridLayer } from '../layers/grid';

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

export const SimulatorStage = forwardRef<Konva.Stage | null, unknown>(function SimulatorStage(
	_props,
	parentStageRef,
) {
	const theme = useThemeContext();
	const stageHandlers = useStageHandlers();
	const appDispatch = useAppDispatch();
	const stageRef = useRef<Konva.Stage | null>(null);
	// small workaround because react=dnd doesn't support key events
	const [snapToGrid, setSnapToGrid] = useState(false);

	const [, drop] = useDrop<DragNDropItem>(
		() => ({
			accept: DragNDropType.CreateElement,
			drop(_data, monitor) {
				if (!monitor.isOver()) {
					appDispatch(clearDraftElement());
					appDispatch(clearSnapLines());
					return;
				}

				if (!stageRef.current) {
					return;
				}

				appDispatch(addDraftElement());
				appDispatch(clearSnapLines());
			},
		}),
		[],
	);

	useEffect(() => {
		const keyDownHandler = (e: KeyboardEvent) => stageHandlers.onKeyDown?.(e, stageRef.current);
		const keyUpHandler = (e: KeyboardEvent) => stageHandlers.onKeyUp?.(e, stageRef.current);
		const dragHandler = (e: DragEvent) => setSnapToGrid(e.shiftKey);

		window.addEventListener('keydown', keyDownHandler, false);
		window.addEventListener('keyup', keyUpHandler, false);
		window.addEventListener('drag', dragHandler, false);

		return () => {
			window.removeEventListener('keydown', keyDownHandler, false);
			window.removeEventListener('keyup', keyUpHandler, false);
			window.removeEventListener('drag', dragHandler, false);
		};
	}, []);

	useEffect(() => {
		if (!stageRef.current) {
			return;
		}

		appDispatch(
			updateCanvasState({
				x: stageRef.current.position().x,
				y: stageRef.current.position().y,
				width: stageRef.current.width(),
				height: stageRef.current.height(),
				scaleX: stageRef.current.scaleX(),
				scaleY: stageRef.current.scaleY(),
			}),
		);
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
				draggable={true}
				ref={handleStageRef}
			>
				<GridLayer />
				<DrawersLayer />
				<AnimationsLayer />
				<DraftLayer />
				<DragNDropLayer snapToGrid={snapToGrid} />
			</Stage>
		</div>
	);
});

