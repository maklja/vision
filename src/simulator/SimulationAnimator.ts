import { AnimationKey } from '../animation';
import { ConnectLine, Element } from '../model';
import { ObservableEvent, ObservableEventType } from '../store/simulationSlice';

export class SimulationAnimator {
	private readonly queuedAnimationEvents: Map<string, ObservableEvent> = new Map();
	private currentEventIndex = 0;

	constructor(private elements: Element[], private connectLines: ConnectLine[]) {}

	createAnimations(events: ObservableEvent[]) {
		if (this.currentEventIndex >= events.length) {
			return [];
		}

		const currentEvent = events[this.currentEventIndex];
		if (currentEvent.type === ObservableEventType.Error) {
			this.currentEventIndex += 1;
			return [this.createErrorAnimation(currentEvent.sourceElementId)];
		}

		const prevEvent = events.at(this.currentEventIndex - 1) ?? null;
	}

	private createErrorAnimation(elementId: string) {
		return {
			drawerId: elementId,
			key: AnimationKey.ErrorDrawer,
		};
	}
}
