import { Layer } from 'react-konva';
import { DraftLineDrawer, SnapLineDrawer } from '../../drawers';
import { useAppSelector } from '../../store/rootState';
import { useBoundingBox, useThemeContext } from '../../store/stageSlice';
import { selectStageDraftConnectLine } from '../../store/connectLines';
import { selectSnapLines } from '../../store/snapLines';
import { selectStageElementById } from '../../store/elements';
import { useMemo } from 'react';
import { useLineSize } from '../../theme';

export const DraftLayer = () => {
	const theme = useThemeContext();
	const lineSize = useLineSize();
	const draftConnectLine = useAppSelector(selectStageDraftConnectLine);
	const snapLines = useAppSelector(selectSnapLines);
	const sourceElement = useAppSelector(
		selectStageElementById(draftConnectLine?.source.id ?? null),
	);
	const elBoundingBox = useBoundingBox(
		sourceElement?.type ?? null,
		{ x: sourceElement?.x ?? 0, y: sourceElement?.y ?? 0 },
		sourceElement?.scale,
	);

	const draftPoints = useMemo(() => {
		if (!draftConnectLine) {
			return [];
		}
		const [p0, p1] = draftConnectLine.points;

		if (p0.x === p1.x) {
			return [
				{
					x: p0.x,
					y: elBoundingBox.center.y + (Math.sign(p1.y - p0.y) * elBoundingBox.height) / 2,
				},
				...draftConnectLine.points.slice(1),
			];
		}

		return [
			{
				x: elBoundingBox.center.x + (Math.sign(p1.x - p0.x) * elBoundingBox.width) / 2,
				y: p0.y,
			},
			...draftConnectLine.points.slice(1),
		];
	}, [draftConnectLine]);

	return (
		<Layer>
			{draftConnectLine ? (
				<DraftLineDrawer
					key={draftConnectLine.id}
					points={draftPoints}
					theme={theme}
					size={lineSize}
					arrowVisible={draftConnectLine.locked}
				/>
			) : null}

			{snapLines.map((snapLine, i) => (
				<SnapLineDrawer key={i} theme={theme} points={snapLine.points} />
			))}
		</Layer>
	);
};

