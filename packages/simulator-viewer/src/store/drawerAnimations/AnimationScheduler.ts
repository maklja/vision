import { v1 } from 'uuid';
import { ConnectLine, FlowValueType, Point } from '@maklja/vision-simulator-model';
import {
	ErrorSimulationAnimation,
	HighlightSimulationAnimation,
	MoveSimulationAnimation,
	ObservableEvent,
} from '../simulation';
import { AnimationKey } from '../../animation';
import { DrawerAnimation } from './drawerAnimationsSlice';

export class AnimationScheduler {
	private readonly animations: Record<string, DrawerAnimation[]> = {};

	constructor(
		private readonly connectLines: readonly ConnectLine[],
		private readonly simulatorId: string,
	) {}

	queueObservableEvent(event: ObservableEvent) {
		const eventAnimation = this.createEventAnimations(event);
		if (!this.animations[event.id]) {
			this.animations[event.id] = eventAnimation;
			return;
		}

		this.animations[event.id].push(...eventAnimation);
		console.log(this.animations);
	}

	private createEventAnimations(event: ObservableEvent): DrawerAnimation[] {
		const { sourceElementId, targetElementId, type, connectLinesId } = event;
		const points = connectLinesId.flatMap(
			(clId) => this.connectLines.find((cl) => cl.id === clId)?.points ?? [],
		);

		const resultAnimations: MoveSimulationAnimation[] = points
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
					id: v1(),
					dispose: false,
					drawerId: this.simulatorId,
					key: AnimationKey.MoveDrawer,
					data: {
						...event,
						sourcePosition,
						targetPosition,
					},
				};
			});

		const animationKey =
			type === FlowValueType.Error ? AnimationKey.ErrorDrawer : AnimationKey.HighlightDrawer;
		const targetAnimation: HighlightSimulationAnimation | ErrorSimulationAnimation = {
			id: v1(),
			dispose: false,
			drawerId: targetElementId,
			key: animationKey,
			data: event,
		};
		const sourceAnimation: HighlightSimulationAnimation | ErrorSimulationAnimation = {
			id: v1(),
			dispose: false,
			drawerId: sourceElementId,
			key: animationKey,
			data: event,
		};

		return [sourceAnimation, ...resultAnimations, targetAnimation];
	}
}

