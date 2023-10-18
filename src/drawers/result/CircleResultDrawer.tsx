import { Vector2d } from 'konva/lib/types';
import { Node } from 'konva/lib/Node';
import Konva from 'konva';
import { useState } from 'react';
import { Circle } from 'react-konva';
import { CircleDrawerProps } from '../DrawerProps';
import { dragBoundFuncHandler, hashToColor, invertColor } from '../utils';
import { useAnimation } from '../../animation';
import { scaleCircleShape, useGridTheme } from '../../theme';

export interface CircleResultDrawerProps extends CircleDrawerProps {
	hash: string;
}

export const CircleResultDrawer = ({
	id,
	theme,
	size,
	x,
	y,
	draggable = false,
	draggableSnap = false,
	visible = true,
	hash,
	animation,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: CircleResultDrawerProps) => {
	const gridTheme = useGridTheme(theme);
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

	const handleDragBoundFunc = function (this: Node, pos: Vector2d) {
		if (!draggableSnap) {
			return pos;
		}

		return dragBoundFuncHandler(this, pos, gridTheme.size);
	};

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
			dragBoundFunc={handleDragBoundFunc}
		/>
	);
};
