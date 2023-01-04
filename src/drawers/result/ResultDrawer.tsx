import { Circle } from 'react-konva';
import { useSizes } from '../../theme';
import { DrawerProps } from '../DrawerProps';
import { hashToColor, invertColor } from '../utils';
import { useState } from 'react';
import Konva from 'konva';
import { useAnimation, useAnimationEffect } from '../../animation';

export interface ResultDrawerProps extends DrawerProps {
	hash: string;
}

export const ResultDrawer = ({
	id,
	theme,
	x,
	y,
	visible = true,
	hash,
	animation,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: ResultDrawerProps) => {
	const { simulation } = theme;
	const { simulationSizes } = useSizes(theme);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);

	const drawerAnimation = useAnimation(mainShapeRef, animation, (a) => ({
		config: a.mainShape,
	}));

	useAnimationEffect(drawerAnimation, {
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		simulationId: animation?.simulationId,
		drawerId: id,
	});

	const resultColor = hashToColor(hash ?? simulation.fill);
	const invertResultColor = invertColor(resultColor, false);
	return (
		<Circle
			visible={visible}
			ref={(node) => setMainShapeRef(node)}
			radius={simulationSizes.radius}
			fill={resultColor}
			stroke={invertResultColor}
			x={x}
			y={y}
		/>
	);
};
