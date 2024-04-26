import { Layer } from 'react-konva';
import { useEffect, useState } from 'react';
import { ConnectLineDrawer, OperatorDrawer, TooltipDrawer } from '../../operatorDrawers';
import { selectStageElements } from '../../store/elements';
import { selectStageConnectLines } from '../../store/connectLines';
import { selectElementSizeOptions, useThemeContext } from '../../store/hooks';
import { useRootStore } from '../../store/rootStore';
import { isStageStateDragging, selectElementTooltip, selectIsDraggable } from '../../store/stage';

const TOOLTIP_SHOW_TIME = 1_000;

export function DrawersLayer() {
	const theme = useThemeContext();
	const elements = useRootStore(selectStageElements());
	const connectLines = useRootStore(selectStageConnectLines());
	const elementSizeOptions = useRootStore(selectElementSizeOptions);
	const tooltip = useRootStore(selectElementTooltip());
	const isDraggable = useRootStore(selectIsDraggable);
	const dragging = useRootStore((state) => isStageStateDragging(state.state));
	const selectedConnectLines = useRootStore((state) => state.selectedConnectLines);

	const [tooltipVisible, setTooltipVisible] = useState(false);

	useEffect(() => {
		if (!tooltip) {
			return;
		}

		const timeoutId = setTimeout(() => setTooltipVisible(true), TOOLTIP_SHOW_TIME);

		return () => {
			clearTimeout(timeoutId);
			setTooltipVisible(false);
		};
	}, [tooltip]);

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

			{tooltip ? (
				<TooltipDrawer
					id={tooltip.id}
					theme={theme}
					text={tooltip.text}
					scale={elementSizeOptions.scale}
					x={tooltip.x}
					y={tooltip.y}
					width={Math.max(tooltip.width, 150)}
					visible={tooltipVisible}
				/>
			) : null}
		</Layer>
	);
}

