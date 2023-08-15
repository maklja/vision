import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { selectStageElements, selectTooltip, useThemeContext } from '../../store/stageSlice';
import { TooltipDrawer } from '../../operatorDrawers';

export const TooltipsLayer = () => {
	const theme = useThemeContext();
	const tooltip = useAppSelector(selectTooltip);
	const elements = useAppSelector(selectStageElements);
	const element = elements.find((curEl) => curEl.id === tooltip?.elementId);

	return (
		<Layer>
			{element && tooltip ? (
				<TooltipDrawer
					id={element.id}
					theme={theme}
					text={tooltip.text}
					scale={element.scale}
					x={element.x}
					y={element.y}
					visible={element.visible}
				/>
			) : null}
		</Layer>
	);
};

