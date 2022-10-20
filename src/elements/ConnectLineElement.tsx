import { Line, Group } from 'react-konva';

export interface ConnectLineElementProps {
	id: string;
	points: { x: number; y: number }[];
}

export const ConnectLineElement = (props: ConnectLineElementProps) => {
	const sourcePoint = props.points[1];
	const targetPoint = props.points[props.points.length - 2];

	const rotateX = sourcePoint.x - targetPoint.x;
	const rotateY = sourcePoint.y - targetPoint.y;

	const angle = Math.PI / 4;
	const rX1 = rotateX * Math.cos(angle) - rotateY * Math.sin(angle) + targetPoint.x;
	const rY1 = rotateY * Math.cos(angle) + rotateX * Math.sin(angle) + targetPoint.y;

	const rX2 = rotateX * Math.cos(-angle) - rotateY * Math.sin(-angle) + 10;
	const rY2 = rotateY * Math.cos(-angle) + rotateX * Math.sin(-angle) + 10;

	const delta = 10;

	return (
		<Group>
			<Line stroke="black" points={props.points.flatMap((p) => [p.x, p.y])} />
			<Line stroke="black" points={[rX1, rY1, targetPoint.x, targetPoint.y]} />
			<Line stroke="black" points={[rX2, rY2, targetPoint.x, targetPoint.y]} />
		</Group>
	);
};

