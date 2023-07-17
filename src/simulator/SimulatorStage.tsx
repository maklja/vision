import Konva from 'konva';
import { Layer, Stage } from 'react-konva';
import { ConnectLineLayer } from '../layers/connectLine';
import { DrawerLayer } from '../layers/drawer';
import { useAppDispatch } from '../store/rootState';
import {
	deleteConnectLineDraw,
	moveConnectLineDraw,
	selectElements,
	useThemeContext,
} from '../store/stageSlice';
import { ConnectableElement, useDrop } from 'react-dnd';
import { ElementType } from '../model';

export const SimulatorStage = () => {
	const { colors } = useThemeContext();
	const appDispatch = useAppDispatch();

	const handleMouseDown = () => appDispatch(selectElements([]));

	const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
		const stage = e.target.getStage();
		const rect = stage?.getContent().getBoundingClientRect();
		const x = e.evt.clientX - (rect?.left ?? 0);
		const y = e.evt.clientY - (rect?.top ?? 0);
		appDispatch(
			moveConnectLineDraw({
				x,
				y,
			}),
		);
	};

	const handleOnMouseUp = () => {
		appDispatch(deleteConnectLineDraw());
	};

	const [collectedProps, drop] = useDrop(() => ({
		accept: ElementType.From,
		canDrop: () => true,
		hover(item) {
			console.log(item);
		},
	}));
	console.log(collectedProps);

	return (
		<div ref={(stageNode) => drop(stageNode)}>
			<Stage
				style={{ backgroundColor: colors.backgroundColor }}
				width={window.innerWidth}
				height={window.innerHeight}
				onMouseDown={handleMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseMove={handleMouseMove}
			>
				<Layer>
					<ConnectLineLayer />
					<DrawerLayer />
				</Layer>
			</Stage>
		</div>
	);
};

