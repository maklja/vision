import { useMemo } from 'react';
import { Path } from 'react-konva';
import { Point } from '@maklja/vision-simulator-model';
import { LineSize } from '../../theme';

export interface LineArrowProps {
	points: Point[];
	size: LineSize;
	fill?: string;
}

export const LineArrow = ({ points, size, fill }: LineArrowProps) => {
	const { arrowSize, arrowAngle } = size;
	const path = useMemo(() => {
		const sourcePoint = points[points.length - 2];
		const targetPoint = points[points.length - 1];

		const t =
			Math.sqrt(
				Math.pow(targetPoint.x - sourcePoint.x, 2) +
					Math.pow(targetPoint.y - sourcePoint.y, 2),
			) - arrowSize;

		// arrow end point that is between source point and endpoint on the specific length
		const arrowX = (arrowSize * sourcePoint.x + t * targetPoint.x) / (t + arrowSize);
		const arrowY = (arrowSize * sourcePoint.y + t * targetPoint.y) / (t + arrowSize);

		// translate a point to a target point
		const rotateX = arrowX - targetPoint.x;
		const rotateY = arrowY - targetPoint.y;

		// do a rotation and revert translation
		const rX1 = rotateX * Math.cos(arrowAngle) - rotateY * Math.sin(arrowAngle) + targetPoint.x;
		const rY1 = rotateY * Math.cos(arrowAngle) + rotateX * Math.sin(arrowAngle) + targetPoint.y;
		const rX2 =
			rotateX * Math.cos(-arrowAngle) - rotateY * Math.sin(-arrowAngle) + targetPoint.x;
		const rY2 =
			rotateY * Math.cos(-arrowAngle) + rotateX * Math.sin(-arrowAngle) + targetPoint.y;
		return `M${targetPoint.x} ${targetPoint.y} L${rX1} ${rY1} L${rX2} ${rY2} Z`;
	}, [points]);

	return <Path listening={false} data={path} fill={fill} />;
};
