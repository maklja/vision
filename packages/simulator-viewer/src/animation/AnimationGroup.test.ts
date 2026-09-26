import { describe, expect, it } from 'vitest';
import { EMPTY, Subject } from 'rxjs';
import { AbstractAnimation, Animation, AnimationEvent, AnimationEventType } from './Animation';
import { AnimationGroup } from './AnimationGroup';

function createFakeAnimation(id: string, log: string[]) {
	const events$ = new Subject<AnimationEvent>();
	const animation: Animation = {
		id,
		observable: () => events$.asObservable(),
		play: async () => {
			log.push(`play:${id}`);
		},
		reverse: async () => {
			log.push(`reverse:${id}`);
		},
		reset: async () => {
			log.push(`reset:${id}`);
		},
		finish: async () => {
			log.push(`finish:${id}`);
		},
		destroy: () => {
			log.push(`destroy:${id}`);
		},
	};

	return { animation, events$ };
}

// A fake animation whose play stays pending until the test releases it, so group callback ordering
// can be characterized without relying on real timers.
class DeferredAnimation extends AbstractAnimation {
	private resolvePlay?: () => void;

	constructor(
		public readonly id: string,
		private readonly log: string[],
	) {
		super();
	}

	observable() {
		return EMPTY;
	}

	play(): Promise<void> {
		this.log.push(`play:${this.id}`);

		return new Promise<void>((resolve) => {
			this.resolvePlay = resolve;
		});
	}

	reverse(): Promise<void> {
		return Promise.resolve();
	}

	reset(): Promise<void> {
		return Promise.resolve();
	}

	finish(): Promise<void> {
		return Promise.resolve();
	}

	destroy(): void {
		this.log.push(`destroy:${this.id}`);
	}

	completePlay() {
		this.resolvePlay?.();
	}
}

describe('AnimationGroup', () => {
	it('generates an id when none is supplied', () => {
		const group = new AnimationGroup([]);

		expect(group.id).toBe('00000000-0000-4000-8000-000000000001');
	});

	it('plays every animation and fires begin before complete', async () => {
		const log: string[] = [];
		const first = createFakeAnimation('first', log);
		const second = createFakeAnimation('second', log);
		const group = new AnimationGroup([first.animation, second.animation], 'group');
		const callbacks: string[] = [];
		group.onAnimationBegin = () => callbacks.push('begin');
		group.onAnimationComplete = () => callbacks.push('complete');

		await group.play();

		expect(log).toEqual(['play:first', 'play:second']);
		expect(callbacks).toEqual(['begin', 'complete']);
	});

	it('completes only after every child play promise resolves', async () => {
		const log: string[] = [];
		const first = new DeferredAnimation('first', log);
		const second = new DeferredAnimation('second', log);
		const group = new AnimationGroup([first, second], 'group');
		group.onAnimationBegin = () => log.push('group:begin');
		group.onAnimationComplete = () => log.push('group:complete');

		const playPromise = group.play();
		expect(log).toEqual(['group:begin', 'play:first', 'play:second']);

		first.completePlay();
		await Promise.resolve();
		expect(log).toEqual(['group:begin', 'play:first', 'play:second']);

		second.completePlay();
		await playPromise;
		expect(log).toEqual(['group:begin', 'play:first', 'play:second', 'group:complete']);
	});

	it('reverses every animation and fires begin before complete', async () => {
		const log: string[] = [];
		const first = createFakeAnimation('first', log);
		const second = createFakeAnimation('second', log);
		const group = new AnimationGroup([first.animation, second.animation], 'group');
		const callbacks: string[] = [];
		group.onAnimationBegin = () => callbacks.push('begin');
		group.onAnimationComplete = () => callbacks.push('complete');

		await group.reverse();

		expect(log).toEqual(['reverse:first', 'reverse:second']);
		expect(callbacks).toEqual(['begin', 'complete']);
	});

	it('resets every animation without firing group callbacks', async () => {
		const log: string[] = [];
		const first = createFakeAnimation('first', log);
		const second = createFakeAnimation('second', log);
		const group = new AnimationGroup([first.animation, second.animation], 'group');
		const callbacks: string[] = [];
		group.onAnimationBegin = () => callbacks.push('begin');
		group.onAnimationComplete = () => callbacks.push('complete');
		group.onAnimationDestroy = () => callbacks.push('destroy');

		await group.reset();

		expect(log).toEqual(['reset:first', 'reset:second']);
		expect(callbacks).toEqual([]);
	});

	it('finishes every animation without firing group callbacks', async () => {
		const log: string[] = [];
		const first = createFakeAnimation('first', log);
		const second = createFakeAnimation('second', log);
		const group = new AnimationGroup([first.animation, second.animation], 'group');
		const callbacks: string[] = [];
		group.onAnimationBegin = () => callbacks.push('begin');
		group.onAnimationComplete = () => callbacks.push('complete');
		group.onAnimationDestroy = () => callbacks.push('destroy');

		await group.finish();

		expect(log).toEqual(['finish:first', 'finish:second']);
		expect(callbacks).toEqual([]);
	});

	it('destroys every animation before firing the destroy callback', () => {
		const log: string[] = [];
		const first = createFakeAnimation('first', log);
		const second = createFakeAnimation('second', log);
		const group = new AnimationGroup([first.animation, second.animation], 'group');
		group.onAnimationDestroy = () => log.push('group:destroy');

		group.destroy();

		expect(log).toEqual(['destroy:first', 'destroy:second', 'group:destroy']);
	});

	it('merges child animation events in child order', () => {
		const log: string[] = [];
		const first = createFakeAnimation('first', log);
		const second = createFakeAnimation('second', log);
		const group = new AnimationGroup([first.animation, second.animation], 'group');
		const received: AnimationEventType[] = [];
		const subscription = group.observable().subscribe((event) => received.push(event.type));

		first.events$.next({
			id: 'first',
			animation: first.animation,
			type: AnimationEventType.Finish,
		});
		second.events$.next({
			id: 'second',
			animation: second.animation,
			type: AnimationEventType.Reset,
		});
		subscription.unsubscribe();

		expect(received).toEqual([AnimationEventType.Finish, AnimationEventType.Reset]);
	});
});
