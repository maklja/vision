import { useEffect, useState } from 'react';
import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { selectElementSizeOptions, useBoundingBox, useThemeContext } from '../../store/stageSlice';
import { TooltipDrawer } from '../../operatorDrawers';
import { selectStageElementById } from '../../store/elements';
import { selectTooltip } from '../../store/tooltip';
import { selectElementErrorById } from '../../store/errors';

const TOOLTIP_SHOW_TIME = 1_000;

export const TooltipsLayer = () => {
	const theme = useThemeContext();
	const tooltip = useAppSelector(selectTooltip);
	const element = useAppSelector(selectStageElementById(tooltip?.elementId ?? null));
	const elementSizeOptions = useAppSelector(selectElementSizeOptions);
	const bb = useBoundingBox(element?.type ?? null, { x: element?.x ?? 0, y: element?.y ?? 0 });
	const error = useAppSelector(selectElementErrorById(element?.id ?? null));
	const text = error?.errorMessage ?? tooltip?.text ?? element?.name;

	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!element?.visible) {
			return;
		}

		const timeoutId = setTimeout(() => setVisible(true), TOOLTIP_SHOW_TIME);

		return () => {
			clearTimeout(timeoutId);
			setVisible(false);
		};
	}, [element]);

	return (
		<Layer>
			{text && element && tooltip ? (
				<TooltipDrawer
					id={element.id}
					theme={theme}
					text={text}
					scale={elementSizeOptions.scale}
					x={bb.center.x}
					y={bb.topLeft.y}
					width={Math.max(bb.width, 150)}
					visible={visible}
				/>
			) : null}
		</Layer>
	);
};
