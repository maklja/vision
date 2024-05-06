import Konva from 'konva';
import { useState } from 'react';
import { Circle } from 'react-konva';
import { CircleDrawerProps } from '../DrawerProps';
import { hashToColor, invertColor } from '../utils';
import { useAnimation } from '../../animation';
import { scaleCircleShape } from '../../theme';

export interface CircleResultDrawerProps extends CircleDrawerProps {
	hash: string;
}

export function CircleResultDrawer({
	id,
	theme,
	size,
	x,
	y,
	draggable = false,
	visible = true,
	hash,
	animation,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: CircleResultDrawerProps) {
	const { simulation } = theme;
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);

	useAnimation(mainShapeRef, {
		animationTemplate: animation,
		mapper: (a) => ({
			config: a.mainShape,
		}),
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		drawerId: id,
	});

	const { radius } = scaleCircleShape(size, 0.3);
	const resultColor = hashToColor(hash ?? simulation.fill);
	const invertResultColor = invertColor(resultColor, false);
	return (
		<Circle
			visible={visible}
			ref={(node) => setMainShapeRef(node)}
			radius={radius}
			fill={resultColor}
			stroke={invertResultColor}
			x={x}
			y={y}
			draggable={draggable}
		/>
	);
}

