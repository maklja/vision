import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import {
	selectStageElementById,
	selectStageElements,
	selectTooltip,
	useShapeSize,
	useThemeContext,
} from '../../store/stageSlice';
import { TooltipDrawer } from '../../operatorDrawers';
import { calculateShapeSizeBoundingBox } from '../../theme';
import { ElementType } from '../../model';

export const TooltipsLayer = () => {
	const theme = useThemeContext();
	const tooltip = useAppSelector(selectTooltip);
	const element = useAppSelector(selectStageElementById(tooltip?.elementId ?? null));
	const size = useShapeSize(element?.type ?? ElementType.Of, element?.scale ?? 1);

	calculateShapeSizeBoundingBox();

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

