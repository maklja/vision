import { ConnectPointsDrawer, BorderDrawer } from '../drawers';
import { ConnectPointType, Element } from '../model';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store/rootState';
import {
	selectHighlightedConnectPointsByElementId,
	StageState,
	isSelectedElement,
	isHighlightedElement,
	selectStageState,
} from '../store/stageSlice';
import { connectPointsConnector } from '../store/connector';
import { Group } from 'react-konva';
import {
	selectedBorderTheme,
	highlightBorderTheme,
	connectPointTheme,
	highlightConnectPointTheme,
} from '../theme';

export interface DrawerProps {
	x?: number;
	y?: number;
	element: Element;
	children?: (stageState: StageState, appDispatch: AppDispatch) => JSX.Element;
}

export const Drawer = ({ element, children, x, y }: DrawerProps) => {
	const appDispatch = useAppDispatch();
	const stageState = useAppSelector(selectStageState);
	const highlightedConnectPoints = useAppSelector(
		selectHighlightedConnectPointsByElementId(element.id),
	).map((cp) => cp.type);
	const selected = useAppSelector(isSelectedElement(element.id));
	const highlighted = useAppSelector(isHighlightedElement(element.id));
	const dragging = stageState === StageState.Dragging;

	const borderStyle = {
		...(highlighted ? highlightBorderTheme : {}),
		...(selected ? selectedBorderTheme : {}),
	};

	return (
		<Group>
			{selected && !dragging ? (
				<ConnectPointsDrawer
					{...connectPointsConnector(stageState)(appDispatch)}
					id={element.id}
					x={x ?? element.x}
					y={y ?? element.y}
					size={element.size}
					styles={{
						[ConnectPointType.Top]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Top)
								? highlightConnectPointTheme
								: {}),
						},
						[ConnectPointType.Bottom]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Bottom)
								? highlightConnectPointTheme
								: {}),
						},
						[ConnectPointType.Left]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Left)
								? highlightConnectPointTheme
								: {}),
						},
						[ConnectPointType.Right]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Right)
								? highlightConnectPointTheme
								: {}),
						},
					}}
				/>
			) : null}

			{selected || highlighted ? (
				<BorderDrawer
					x={x ?? element.x}
					y={y ?? element.y}
					size={element.size}
					padding={3}
					style={borderStyle}
				/>
			) : null}

			{children?.(stageState, appDispatch)}
		</Group>
	);
};
