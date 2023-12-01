import { Layer } from 'react-konva';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/rootState';
import { ConnectLineDrawer, OperatorDrawer, TooltipDrawer } from '../../operatorDrawers';
import { selectStageElementById, selectStageElements } from '../../store/elements';
import { SimulationState, selectSimulation } from '../../store/simulation';
import { isStageStateDragging, selectStageState } from '../../store/stage';
import { selectTooltip } from '../../store/tooltip';
import { selectElementSizeOptions, useBoundingBox, useThemeContext } from '../../store/stageSlice';
import { selectElementErrorById } from '../../store/errors';
import { selectStageConnectLines } from '../../store/connectLines';

const TOOLTIP_SHOW_TIME = 1_000;

export const DrawersLayer = () => {
	const theme = useThemeContext();
	const simulation = useAppSelector(selectSimulation);
	const elements = useAppSelector(selectStageElements);
	const connectLines = useAppSelector(selectStageConnectLines);

	const stageState = useAppSelector(selectStageState);
	const dragging = isStageStateDragging(stageState);

	const tooltip = useAppSelector(selectTooltip);
	const element = useAppSelector(selectStageElementById(tooltip?.elementId ?? null));
	const elementSizeOptions = useAppSelector(selectElementSizeOptions);
	const bb = useBoundingBox(element?.type ?? null, { x: element?.x ?? 0, y: element?.y ?? 0 });
	const error = useAppSelector(selectElementErrorById(element?.id ?? null));
	const text = error?.errorMessage ?? tooltip?.text ?? element?.name;

	const [tooltipVisible, setTooltipVisible] = useState(false);

	useEffect(() => {
		if (!element?.visible) {
			return;
		}

		const timeoutId = setTimeout(() => setTooltipVisible(true), TOOLTIP_SHOW_TIME);

		return () => {
			clearTimeout(timeoutId);
			setTooltipVisible(false);
		};
	}, [element]);

	const isDraggable = simulation.state !== SimulationState.Running;
	return (
		<Layer>
			{connectLines.map((cl) => (
				<ConnectLineDrawer key={cl.id} connectLine={cl} draggable={isDraggable} />
			))}

			{elements.map((el) => (
				<OperatorDrawer
					key={el.id}
					element={el}
					visibleConnectPoints={!dragging}
					draggable={isDraggable}
				/>
			))}

			{text && element && tooltip ? (
				<TooltipDrawer
					id={element.id}
					theme={theme}
					text={text}
					scale={elementSizeOptions.scale}
					x={bb.center.x}
					y={bb.topLeft.y}
					width={Math.max(bb.width, 150)}
					visible={tooltipVisible}
				/>
			) : null}
		</Layer>
	);
};

