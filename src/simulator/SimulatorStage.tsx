import Konva from 'konva';
import { Layer, Stage } from 'react-konva';
import { ConnectableElement, useDrop } from 'react-dnd';
import { ConnectLineLayer } from '../layers/connectLine';
import { DrawerLayer } from '../layers/drawer';
import { useAppDispatch, useAppSelector } from '../store/rootState';
import {
	StageState,
	addElement,
	changeState,
	deleteConnectLineDraw,
	moveConnectLineDraw,
	moveElement,
	selectElements,
	selectStageElementById,
	useThemeContext,
} from '../store/stageSlice';
import { ElementType } from '../model';
import { findElementDrawerFactory } from '../layers/drawer/createElementDrawer';

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
	const creationElement = useAppSelector(selectStageElementById('creation'));

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

	const [propsss, drop] = useDrop<any, any, any>(
		() => ({
			accept: Object.values(ElementType),
			collect: (monitor) => {
				console.log('changed', monitor.isOver());
				// const item = monitor.getItem();
				// if (!item) {
				// 	return {
				// 		drawerFactory: null,
				// 		position: { x: 0, y: 0 },
				// 	};
				// }
				// const factory = findElementDrawerFactory((monitor.getItem() as any).type);
				// return {
				// 	drawerFactory: factory,
				// 	position: monitor.getClientOffset() ?? { x: 0, y: 0 },
				// };

				// return factory?.({
				// 	id: 'creation',
				// 	size: 1,
				// 	theme,
				// 	x: monitor.getClientOffset()?.x ?? 0,
				// 	y: monitor.getClientOffset()?.y ?? 0,
				// 	select: true,
				// });
			},
			hover(item: any, monitor) {
				// console.log(creationElement);
				// if (creationElement == null) {
				// 	appDispatch(
				// 		addElement({
				// 			id: 'creation',
				// 			size: 1,
				// 			type: item.type,
				// 			visible: true,
				// 			x: monitor.getClientOffset()?.x ?? 0 - 40,
				// 			y: monitor.getClientOffset()?.y ?? 0 - 40,
				// 			properties: {},
				// 		}),
				// 	);
				// 	appDispatch(changeState(StageState.Dragging));
				// 	appDispatch(
				// 		selectElements([
				// 			{ id: 'creation', visibleConnectPoints: { input: false } },
				// 		]),
				// 	);
				// } else {
				// 	appDispatch(
				// 		moveElement({
				// 			id: 'creation',
				// 			x: monitor.getClientOffset()?.x ?? 0 - 20,
				// 			y: monitor.getClientOffset()?.y ?? 0 - 20,
				// 		}),
				// 	);
				// }
				// console.log(item);
			},
			drop(item, monitor) {
				console.log('drop', item, monitor.didDrop(), monitor.getHandlerId());
				// return { test: 'test' };
			},
		}),
		[],
	);
	// console.log('xx', collectedProps);

	return (
		<div ref={(stageNode) => drop(stageNode)}>
			<Stage
				style={{ backgroundColor: theme.colors.backgroundColor }}
				width={window.innerWidth}
				height={window.innerHeight}
				onMouseDown={handleMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseMove={handleMouseMove}
			>
				<Layer onMouseMove={(e) => console.log(e)}>
					<ConnectLineLayer />
					<DrawerLayer />
				</Layer>
			</Stage>
		</div>
	);
};
