import { Line, Group } from 'react-konva';
import { Point } from '../../model';
import { Theme } from '../../theme';
import { ConnectLineArrow } from './ConnectLineArrow';

export interface ConnectLineDrawerProps {
	id: string;
	points: Point[];
	theme: Theme;
	visible?: boolean;
}

// float dx = x1 - x0; //delta x
// float dy = y1 - y0; //delta y
// float linelength = sqrtf(dx * dx + dy * dy);
// dx /= linelength;
// dy /= linelength;
// //Ok, (dx, dy) is now a unit vector pointing in the direction of the line
// //A perpendicular vector is given by (-dy, dx)
// const float thickness = 5.0f; //Some number
// const float px = 0.5f * thickness * (-dy); //perpendicular vector with lenght thickness * 0.5
// const float py = 0.5f * thickness * dx;
// glBegin(GL_QUADS);
// glVertex2f(x0 + px, y0 + py);
// glVertex2f(x1 + px, y1 + py);
// glVertex2f(x1 - px, y1 - py);
// glVertex2f(x0 - px, y0 - py);
// glEnd();

const createPolygon = (p0: Point, p1: Point, thickness = 5): Point[] => {
	const dx = p1.x - p0.x;
	const dy = p1.y - p0.y;
	const lineLength = Math.sqrt(dx * dx + dy * dy);

	const directionX = dx / lineLength;
	const directionY = dy / lineLength;

	const px = 0.5 * thickness * -directionX;
	const py = 0.5 * thickness * directionY;

	return [];
};

export const ConnectLineDrawer = ({ points, theme, visible = true }: ConnectLineDrawerProps) => {
	const drawAnArrow = points.length > 3;

	return (
		<Group visible={visible}>
			<Line
				{...theme.connectLine.line}
				perfectDrawEnabled={false}
				points={points.flatMap((p) => [p.x, p.y])}
			/>
			{drawAnArrow ? <ConnectLineArrow {...theme.connectLine.arrow} points={points} /> : null}
		</Group>
	);
};
