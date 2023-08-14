import { AnimationKey } from '../../animation';
import { FlowValueType } from '../../engine';
import { ConnectLine, Point } from '../../model';
import { ObservableEvent } from '../../store/reducer';

export const createAnimations = (
	events: (ObservableEvent | null)[],
	connectLines: ConnectLine[],
	simulatorId: string,
) => {
	const [prevEvent, currentEvent] = events;
	if (!currentEvent) {
		return [];
	}

	const { sourceElementId, targetElementId, type, connectLinesId } = currentEvent;
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
					...currentEvent,
					sourcePosition,
					targetPosition,
				},
			};
		});

	const animationKey =
		type === FlowValueType.Error ? AnimationKey.ErrorDrawer : AnimationKey.HighlightDrawer;
	const targetAnimation = {
		drawerId: targetElementId,
		key: animationKey,
		data: currentEvent,
	};

	// if not equals do not show previous drawer animation otherwise do show it
	const showSameElementANimation =
		prevEvent?.targetElementId !== sourceElementId || prevEvent?.type !== type;
	return showSameElementANimation
		? [
				{
					drawerId: sourceElementId,
					key: animationKey,
					data: currentEvent,
				},
				...resultAnimations,
				targetAnimation,
		  ]
		: [...resultAnimations, targetAnimation];
};
