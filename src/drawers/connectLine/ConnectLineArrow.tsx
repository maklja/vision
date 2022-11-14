import { useMemo } from 'react';
import { Path } from 'react-konva';
import { Point } from '../../model';

const ARROW_SIZE = 15;
const ARROW_ANGLE = Math.PI / 6;

export interface ConnectLineArrowProps {
	points: Point[];
	fill?: string;
}

export const ConnectLineArrow = ({ points, fill }: ConnectLineArrowProps) => {
	const path = useMemo(() => {
		const sourcePoint = points[1];
		const targetPoint = points[points.length - 2];

		const t =
			Math.sqrt(
				Math.pow(targetPoint.x - sourcePoint.x, 2) +
					Math.pow(targetPoint.y - sourcePoint.y, 2),
			) - ARROW_SIZE;

		// arrow end point that is between source point and endpoint on the specific length
		const arrowX = (ARROW_SIZE * sourcePoint.x + t * targetPoint.x) / (t + ARROW_SIZE);
		const arrowY = (ARROW_SIZE * sourcePoint.y + t * targetPoint.y) / (t + ARROW_SIZE);

		// translate a point to a target point
		const rotateX = arrowX - targetPoint.x;
		const rotateY = arrowY - targetPoint.y;

		// do a rotation and revert translation
		const rX1 =
			rotateX * Math.cos(ARROW_ANGLE) - rotateY * Math.sin(ARROW_ANGLE) + targetPoint.x;
		const rY1 =
			rotateY * Math.cos(ARROW_ANGLE) + rotateX * Math.sin(ARROW_ANGLE) + targetPoint.y;
		const rX2 =
			rotateX * Math.cos(-ARROW_ANGLE) - rotateY * Math.sin(-ARROW_ANGLE) + targetPoint.x;
		const rY2 =
			rotateY * Math.cos(-ARROW_ANGLE) + rotateX * Math.sin(-ARROW_ANGLE) + targetPoint.y;
		return `M${targetPoint.x} ${targetPoint.y} L${rX1} ${rY1} L${rX2} ${rY2} Z`;
	}, [points]);

	return <Path data={path} fill={fill} />;
};

