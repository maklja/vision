import { filter, firstValueFrom, map, scan } from 'rxjs';
import { AnimationEventType, Animation } from './Animation';

export type AnimationOrchestratorEventType = AnimationEventType.Reset | AnimationEventType.Finish;

const PATTERN_ANIMATION_EVENT_TYPES = new Set([
	AnimationEventType.Reset,
	AnimationEventType.Finish,
]);

export const SINGLE_TIMELINE_PATTERNS: AnimationOrchestratorEventType[][] = [
	[AnimationEventType.Finish],
	[AnimationEventType.Reset, AnimationEventType.Finish],
];

export const FLIP_TIMELINE_PATTERNS: AnimationOrchestratorEventType[][] = [
	[AnimationEventType.Finish, AnimationEventType.Reset],
	[AnimationEventType.Reset, AnimationEventType.Finish, AnimationEventType.Reset],
];

export const REVERSE_SINGLE_TIMELINE_PATTERNS: AnimationOrchestratorEventType[][] = [
	[AnimationEventType.Reset],
	[AnimationEventType.Finish, AnimationEventType.Reset],
];

export const animationOrchestrator = (
	animation: Animation,
	patterns: AnimationOrchestratorEventType[][],
) => {
	const maxStateLength = Math.max(...patterns.map((pattern) => pattern.length));
	const patternChecker$ = animation.observable().pipe(
		filter((event) => PATTERN_ANIMATION_EVENT_TYPES.has(event.type)),
		scan(
			(state: AnimationEventType[], event) =>
				state.length > maxStateLength
					? [...state.slice(-1), event.type]
					: [...state, event.type],
			[],
		),
		filter((state) =>
			patterns
				.filter((pattern) => pattern.length === state.length)
				.map((pattern) => pattern.every((eventType, i) => eventType === state[i]))
				.reduce((match, curPatternMatch) => match || curPatternMatch, false),
		),
		map(() => null),
	);

	return firstValueFrom(patternChecker$);
};
