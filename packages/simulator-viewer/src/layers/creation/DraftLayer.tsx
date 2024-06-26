import { Layer } from 'react-konva';
import { DraftLineDrawer, SnapLineDrawer, LassoSelection } from '../../drawers';
import { selectStageDraftConnectLine } from '../../store/connectLines';
import { selectSnapLines } from '../../store/snapLines';
import { useMemo } from 'react';
import { useLineSize } from '../../theme';
import { selectLasso } from '../../store/stage';
import { useBoundingBox, useThemeContext } from '../../store/hooks';
import { useRootStore } from '../../store/rootStore';

export function DraftLayer() {
	const theme = useThemeContext();
	const lineSize = useLineSize();
	const draftConnectLine = useRootStore(selectStageDraftConnectLine());
	const snapLines = useRootStore(selectSnapLines);
	const lassoBoundingBox = useRootStore(selectLasso());
	const elBoundingBox = useBoundingBox(draftConnectLine?.source.id ?? null);

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

			{lassoBoundingBox ? (
				<LassoSelection
					x={lassoBoundingBox.x}
					y={lassoBoundingBox.y}
					width={lassoBoundingBox.width}
					height={lassoBoundingBox.height}
					theme={theme}
				/>
			) : null}

			{snapLines.map((snapLine, i) => (
				<SnapLineDrawer key={i} theme={theme} points={snapLine.points} />
			))}
		</Layer>
	);
}

