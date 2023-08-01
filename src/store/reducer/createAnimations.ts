import { AnimationKey } from '../../animation';
import { ConnectLine, Point } from '../../model';
import { ObservableEvent, ObservableEventType } from './simulationReducer';

export const createAnimations = (
	animations: (ObservableEvent | null)[],
	connectLines: ConnectLine[],
	simulatorId: string,
) => {
	const [prevEvent, currentEvent] = animations;
	if (!currentEvent) {
		return [];
	}
	const { sourceElementId, targetElementId, type, connectLinesId, hash } = currentEvent;
	if (type === ObservableEventType.Error) {
		return [
			{
				drawerId: sourceElementId,
				key: AnimationKey.ErrorDrawer,
			},
		];
	}

	const points = connectLinesId.flatMap((clId) => {
		const connectLine = connectLines.find((cl) => cl.id === clId);

		return connectLine ? connectLine.points : [];
	});

	const resultAnimations = points
		.slice(1, points.length - 1)
		.reduce((groupedPoints: Point[][], sourcePosition, i, pointsSlice) => {
			const targetPosition = pointsSlice[i + 1];
			if (targetPosition == null) {
				return groupedPoints;
			}

			return [...groupedPoints, [sourcePosition, targetPosition]];
		}, [])
		.map((pointsGroup) => {
			const [sourcePosition, targetPosition] = pointsGroup;
			return {
				drawerId: simulatorId,
				key: AnimationKey.MoveDrawer,
				data: {
					sourcePosition,
					targetPosition,
					hash,
				},
			};
		});

	const targetAnimation = {
		drawerId: targetElementId,
		key: AnimationKey.HighlightDrawer,
	};
	// if not equals do not show previous drawer animation otherwise do show it
	return prevEvent?.targetElementId !== sourceElementId
		? [
				{
					drawerId: sourceElementId,
					key: AnimationKey.HighlightDrawer,
				},
				...resultAnimations,
				targetAnimation,
		  ]
		: [...resultAnimations, targetAnimation];
};

