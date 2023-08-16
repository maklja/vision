import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import {
	selectElementErrorById,
	selectStageElementById,
	selectTooltip,
	useBoundingBox,
	useThemeContext,
} from '../../store/stageSlice';
import { TooltipDrawer } from '../../operatorDrawers';

export const TooltipsLayer = () => {
	const theme = useThemeContext();
	const tooltip = useAppSelector(selectTooltip);
	const element = useAppSelector(selectStageElementById(tooltip?.elementId ?? null));
	const bb = useBoundingBox(
		element?.type ?? null,
		{ x: element?.x ?? 0, y: element?.y ?? 0 },
		element?.scale ?? 1,
	);
	const error = useAppSelector(selectElementErrorById(element?.id ?? null));
	const text = error?.errorMessage ?? tooltip?.text;
	return (
		<Layer>
			{text && element && tooltip ? (
				<TooltipDrawer
					id={element.id}
					theme={theme}
					text={text}
					scale={element.scale}
					x={bb.center.x}
					y={bb.topLeft.y}
					width={Math.max(bb.width, 150)}
					visible={element.visible}
				/>
			) : null}
		</Layer>
	);
};

