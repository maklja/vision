import { describe, expect, it } from 'vitest';
import { Subject } from 'rxjs';
import { Animation, AnimationEvent, AnimationEventType } from './Animation';
import {
	animationOrchestrator,
	AnimationOrchestratorEventType,
	FLIP_TIMELINE_PATTERNS,
	REVERSE_SINGLE_TIMELINE_PATTERNS,
	SINGLE_TIMELINE_PATTERNS,
} from './animationOrchestrator';

function createFakeAnimation() {
	const events$ = new Subject<AnimationEvent>();
	const animation: Animation = {
		id: 'animation',
		observable: () => events$.asObservable(),
		play: () => Promise.resolve(),
		reverse: () => Promise.resolve(),
		reset: () => Promise.resolve(),
		finish: () => Promise.resolve(),
		destroy: () => undefined,
	};

	return { animation, events$ };
}

function emit(events$: Subject<AnimationEvent>, animation: Animation, types: AnimationEventType[]) {
	types.forEach((type) => events$.next({ id: animation.id, animation, type }));
}

function trackResolution(promise: Promise<unknown>) {
	const state = { resolved: false };
	promise.then(() => {
		state.resolved = true;
	});

	return state;
}

async function flushMicrotasks() {
	await Promise.resolve();
	await Promise.resolve();
}

const acceptedTimelines: {
	name: string;
	patterns: AnimationOrchestratorEventType[][];
	events: AnimationEventType[];
}[] = [
	{
		name: 'single finish',
		patterns: SINGLE_TIMELINE_PATTERNS,
		events: [AnimationEventType.Finish],
	},
	{
		name: 'single reset then finish',
		patterns: SINGLE_TIMELINE_PATTERNS,
		events: [AnimationEventType.Reset, AnimationEventType.Finish],
	},
	{
		name: 'flip finish then reset',
		patterns: FLIP_TIMELINE_PATTERNS,
		events: [AnimationEventType.Finish, AnimationEventType.Reset],
	},
	{
		name: 'flip reset finish reset',
		patterns: FLIP_TIMELINE_PATTERNS,
		events: [AnimationEventType.Reset, AnimationEventType.Finish, AnimationEventType.Reset],
	},
	{
		name: 'reverse reset',
		patterns: REVERSE_SINGLE_TIMELINE_PATTERNS,
		events: [AnimationEventType.Reset],
	},
	{
		name: 'reverse finish then reset',
		patterns: REVERSE_SINGLE_TIMELINE_PATTERNS,
		events: [AnimationEventType.Finish, AnimationEventType.Reset],
	},
];

describe('animationOrchestrator', () => {
	it.each(acceptedTimelines)('resolves the $name timeline', async ({ patterns, events }) => {
		const { animation, events$ } = createFakeAnimation();
		const resolution = trackResolution(animationOrchestrator(animation, patterns));

		emit(events$, animation, events);
		await flushMicrotasks();

		expect(resolution.resolved).toBe(true);
	});

	it('does not resolve when only destroy events are emitted', async () => {
		const { animation, events$ } = createFakeAnimation();
		const resolution = trackResolution(
			animationOrchestrator(animation, REVERSE_SINGLE_TIMELINE_PATTERNS),
		);

		emit(events$, animation, [AnimationEventType.Destroy, AnimationEventType.Destroy]);
		await flushMicrotasks();

		expect(resolution.resolved).toBe(false);
	});

	it('ignores destroy events interleaved with timeline events', async () => {
		const { animation, events$ } = createFakeAnimation();
		const resolution = trackResolution(
			animationOrchestrator(animation, SINGLE_TIMELINE_PATTERNS),
		);

		emit(events$, animation, [AnimationEventType.Destroy, AnimationEventType.Finish]);
		await flushMicrotasks();

		expect(resolution.resolved).toBe(true);
	});

	it('does not resolve a timeline whose events arrive in the wrong order', async () => {
		const { animation, events$ } = createFakeAnimation();
		const resolution = trackResolution(
			animationOrchestrator(animation, FLIP_TIMELINE_PATTERNS),
		);

		emit(events$, animation, [AnimationEventType.Reset, AnimationEventType.Finish]);
		await flushMicrotasks();

		expect(resolution.resolved).toBe(false);
	});

	it('waits for the full pattern before resolving', async () => {
		const { animation, events$ } = createFakeAnimation();
		const resolution = trackResolution(
			animationOrchestrator(animation, [
				[AnimationEventType.Reset, AnimationEventType.Finish],
			]),
		);

		emit(events$, animation, [AnimationEventType.Reset]);
		await flushMicrotasks();
		expect(resolution.resolved).toBe(false);

		emit(events$, animation, [AnimationEventType.Finish]);
		await flushMicrotasks();
		expect(resolution.resolved).toBe(true);
	});
});
