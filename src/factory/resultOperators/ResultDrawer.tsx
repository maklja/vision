import { useEffect, useState } from 'react';
import Konva from 'konva';
import { Circle, Group } from 'react-konva';
import { useAnimation } from '../../animation';
import { hashToColor, invertColor } from '../../drawers/utils';
import { ResultElement } from '../../model';
import { useCircleShapeSize, useThemeContext } from '../../store/stageSlice';
import { useAppSelector } from '../../store/rootState';
import { selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useElementDrawerHandlers } from '../../layers/drawers/state';

export interface ResultDrawerProps {
	element: ResultElement;
}

export const ResultDrawer = ({ element }: ResultDrawerProps) => {
	const { simulation } = useThemeContext(element.type);
	const animation = useAppSelector(selectDrawerAnimationById(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const circleShapeSize = useCircleShapeSize(element.type);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);

	useAnimation(mainShapeRef, {
		animationTemplate: animation,
		mapper: (a) => ({
			config: a.mainShape,
		}),
		onAnimationBegin: drawerHandlers.onAnimationBegin,
		onAnimationComplete: drawerHandlers.onAnimationComplete,
		onAnimationDestroy: drawerHandlers.onAnimationDestroy,
		drawerId: element.id,
	});

	const resultColor = hashToColor(element.properties.hash ?? simulation.fill);
	const invertResultColor = invertColor(resultColor, false);
	return (
		<Group visible={element.visible && Boolean(mainShapeRef)}>
			<Circle
				id={element.id}
				ref={(ref) => {
					console.log(ref);
					ref && setMainShapeRef(ref);
				}}
				radius={circleShapeSize.radius}
				fill={resultColor}
				stroke={invertResultColor}
				x={element.x}
				y={element.y}
			/>
		</Group>
	);
};

