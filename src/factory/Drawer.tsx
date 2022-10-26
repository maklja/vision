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
import { DRAWER_DEFAULT, fromSize } from '../drawers/utils';
import { Group } from 'react-konva';
import {
	selectedBorderTheme,
	highlightBorderTheme,
	connectPointTheme,
	highlightConnectPointTheme,
} from '../theme';

export interface DrawerProps {
	element: Element;
	children?: (stageState: StageState, appDispatch: AppDispatch) => JSX.Element;
}

export const Drawer = ({ element, children }: DrawerProps) => {
	const appDispatch = useAppDispatch();
	const stageState = useAppSelector(selectStageState);
	const highlightedConnectPoints = useAppSelector(
		selectHighlightedConnectPointsByElementId(element.id),
	).map((cp) => cp.type);
	const selected = useAppSelector(isSelectedElement(element.id));
	const highlighted = useAppSelector(isHighlightedElement(element.id));
	const dragging = stageState === StageState.Dragging;

	const width = fromSize(DRAWER_DEFAULT.width);
	const height = fromSize(DRAWER_DEFAULT.height);
	const borderStyle = {
		...(highlighted ? highlightBorderTheme : {}),
		...(selected ? selectedBorderTheme : {}),
	};

	return (
		<Group>
			{selected && !dragging ? (
				<ConnectPointsDrawer
					{...connectPointsConnector(stageState)(appDispatch, element)}
					id={element.id}
					x={element.x - width / 2}
					y={element.y - height / 2}
					width={width}
					height={height}
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
					x={element.x - width / 2}
					y={element.y - height / 2}
					width={width}
					height={height}
					padding={1}
					style={borderStyle}
				/>
			) : null}

			{children?.(stageState, appDispatch)}
		</Group>
	);
};

