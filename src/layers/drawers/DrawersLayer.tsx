import { Layer } from 'react-konva';
import { useEffect, useState } from 'react';
import { ConnectLineDrawer, OperatorDrawer, TooltipDrawer } from '../../operatorDrawers';
import { selectStageElements, selectStageElementById } from '../../store/elements';
import { SimulationState, selectSimulation } from '../../store/simulation';
import {
	isElementDragAllowed,
	isStageStateDragging,
	selectStageState,
	selectTooltip,
} from '../../store/stage';
import { selectElementErrorById } from '../../store/errors';
import { selectStageConnectLines } from '../../store/connectLines';
import { selectElementSizeOptions, useBoundingBox, useThemeContext } from '../../store/hooks';
import { useStore } from '../../store/rootState';

const TOOLTIP_SHOW_TIME = 1_000;

export const DrawersLayer = () => {
	const theme = useThemeContext();
	const simulation = useStore(selectSimulation);
	const elements = useStore(selectStageElements());
	const connectLines = useStore(selectStageConnectLines());
	const selectedConnectLines = useStore((state) => state.selectedConnectLines);

	const stageState = useStore(selectStageState());
	const dragging = isStageStateDragging(stageState);

	const tooltip = useStore(selectTooltip);
	const element = useStore(selectStageElementById(tooltip?.elementId ?? null));
	const elementSizeOptions = useStore(selectElementSizeOptions);
	const bb = useBoundingBox(element?.type ?? null, { x: element?.x ?? 0, y: element?.y ?? 0 });
	const error = useStore(selectElementErrorById(element?.id ?? null));
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

	const isDraggable =
		simulation.state !== SimulationState.Running && isElementDragAllowed(stageState);
	return (
		<Layer>
			{connectLines.map((cl) => (
				<ConnectLineDrawer
					key={cl.id}
					connectLine={cl}
					select={selectedConnectLines.includes(cl.id)}
					draggable={isDraggable}
				/>
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
