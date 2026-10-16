import { act, cleanup, render } from '@testing-library/react';
import { StrictMode, useLayoutEffect, useState } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type Konva from 'konva';
import { useAnimation } from './useAnimation';
import { DrawerAnimationTemplate } from '../AnimationTemplate';
import { AnimationKey } from '../registry/AnimationKey';

const tweens = vi.hoisted(() => ({
	autoFinish: true,
	instances: [] as {
		finish: () => void;
		start: number;
		end: number;
		play: ReturnType<typeof vi.fn>;
		reset: ReturnType<typeof vi.fn>;
		destroy: ReturnType<typeof vi.fn>;
	}[],
}));

// Model Konva's constructor-time position capture and disposal reset. Keep the real
// useAnimation and TweenAnimation so the test exercises their React lifecycle together.
vi.mock('konva', () => ({
	default: {
		Tween: class {
			onReset?: () => void;
			onFinish?: () => void;
			start: number;
			end: number;
			constructor(private config: { node: { x: number }; x: number }) {
				this.start = config.node.x;
				this.end = config.x;
				tweens.instances.push(this);
			}
			finish = () => {
				this.config.node.x = this.end;
				this.onFinish?.();
			};
			play = vi.fn(() => {
				if (tweens.autoFinish) this.finish();
			});
			reset = vi.fn(() => {
				this.config.node.x = this.start;
				this.onReset?.();
			});
			destroy = vi.fn();
		},
	},
}));

beforeEach(() => {
	tweens.instances.length = 0;
	tweens.autoFinish = true;
});
afterEach(cleanup);

it('starts filter → subscribe at the filter after interval → filter finishes and resets', async () => {
	const node = { x: 100 };
	const onComplete = vi.fn();
	const onDestroy = vi.fn();
	function Drawer({ x, template }: { x: number; template: DrawerAnimationTemplate | null }) {
		useAnimation(template, [[node as unknown as Konva.Node, template?.mainShape]], {
			drawerId: 'value',
			onAnimationComplete: onComplete,
			onAnimationDestroy: onDestroy,
		});
		// React Konva updates host-node coordinates during commit, after the hook renders.
		useLayoutEffect(() => {
			node.x = x;
		}, [x]);
		return null;
	}
	const incoming: DrawerAnimationTemplate = {
		id: 'interval-filter',
		groupId: 'value',
		key: AnimationKey.MoveDrawer,
		dispose: false,
		mainShape: { x: 250, duration: 0.6 },
	};
	const outgoing: DrawerAnimationTemplate = {
		...incoming,
		id: 'filter-subscribe',
		mainShape: { x: 500, duration: 0.8 },
	};
	const view = render(<Drawer x={100} template={null} />);
	await act(async () => view.rerender(<Drawer x={100} template={incoming} />));
	expect(tweens.instances[0]).toMatchObject({ start: 100, end: 250 });
	expect(node.x).toBe(250);
	expect(onComplete).toHaveBeenCalledTimes(1);

	await act(async () =>
		view.rerender(<Drawer x={100} template={{ ...incoming, dispose: true }} />),
	);
	expect(node.x).toBe(100);
	expect(onDestroy).toHaveBeenCalledTimes(1);

	// The filter highlight has no movement template. The next edge positions the value
	// at the filter output (300) before playback toward subscribe (500).
	view.rerender(<Drawer x={100} template={null} />);
	await act(async () => view.rerender(<Drawer x={300} template={outgoing} />));
	expect(tweens.instances[1]).toMatchObject({ start: 300, end: 500 });
	expect(node.x).toBe(500);
	expect(onComplete).toHaveBeenCalledTimes(2);
	expect(tweens.instances[0].destroy).toHaveBeenCalledTimes(1);
	view.unmount();
	expect(tweens.instances[1].destroy).toHaveBeenCalledTimes(1);
});

it('does not allocate a Konva tween when an unused render wrapper is destroyed', async () => {
	const { TweenAnimation } = await import('../tween');
	const animation = new TweenAnimation({ node: { x: 100 } as unknown as Konva.Node, x: 250 });
	const onDestroy = vi.fn();
	animation.onAnimationDestroy = onDestroy;
	animation.destroy();
	animation.destroy();
	await animation.play();
	expect(tweens.instances).toHaveLength(0);
	expect(onDestroy).toHaveBeenCalledTimes(1);
});

it.each([1, 2])('recreates a %i-part animation after StrictMode cleanup', async (partCount) => {
	tweens.autoFinish = false;
	const nodes = Array.from({ length: partCount }, () => ({ x: 100 }));
	const onComplete = vi.fn();
	const onDestroy = vi.fn();
	const template: DrawerAnimationTemplate = {
		id: 'strict-move',
		groupId: 'value',
		key: AnimationKey.MoveDrawer,
		dispose: false,
		mainShape: { x: 250 },
	};
	function Drawer({ dispose = false }: { dispose?: boolean }) {
		useAnimation(
			{ ...template, dispose },
			nodes.map((node) => [node as unknown as Konva.Node, template.mainShape]),
			{
				drawerId: 'value',
				onAnimationComplete: onComplete,
				onAnimationDestroy: onDestroy,
			},
		);
		return null;
	}
	const view = render(
		<StrictMode>
			<Drawer />
		</StrictMode>,
	);
	expect(tweens.instances).toHaveLength(partCount * 2);
	const cancelled = tweens.instances.slice(0, partCount);
	const active = tweens.instances.slice(partCount);
	for (const tween of cancelled) {
		expect(tween.play).toHaveBeenCalledTimes(1);
		expect(tween.destroy).toHaveBeenCalledTimes(1);
	}
	for (const tween of active) {
		expect(tween.play).toHaveBeenCalledTimes(1);
		expect(tween.destroy).not.toHaveBeenCalled();
	}
	expect(onDestroy).not.toHaveBeenCalled();
	await act(async () => {
		cancelled.forEach((tween) => tween.finish());
	});
	expect(onComplete).not.toHaveBeenCalled();
	await act(async () => {
		active.forEach((tween) => tween.finish());
	});
	expect(onComplete).toHaveBeenCalledTimes(1);
	await act(async () =>
		view.rerender(
			<StrictMode>
				<Drawer dispose />
			</StrictMode>,
		),
	);
	expect(onDestroy).toHaveBeenCalledTimes(1);
	view.unmount();
	expect(onDestroy).toHaveBeenCalledTimes(1);
	for (const tween of tweens.instances) expect(tween.destroy).toHaveBeenCalledTimes(1);
});

it('starts a mounted animation when its callback ref becomes available in StrictMode', async () => {
	const node = { x: 100 };
	const onComplete = vi.fn();
	function Drawer() {
		const [canvasNode, setCanvasNode] = useState<Konva.Node | null>(null);
		useAnimation(
			{
				id: 'ref-move',
				groupId: 'value',
				key: AnimationKey.MoveDrawer,
				dispose: false,
				mainShape: { x: 250 },
			},
			[[canvasNode, { x: 250 }]],
			{ drawerId: 'value', onAnimationComplete: onComplete },
		);
		return (
			<div
				ref={(element) => setCanvasNode(element ? (node as unknown as Konva.Node) : null)}
			/>
		);
	}
	await act(async () => {
		render(
			<StrictMode>
				<Drawer />
			</StrictMode>,
		);
	});
	expect(tweens.instances).toHaveLength(1);
	expect(tweens.instances[0].play).toHaveBeenCalledTimes(1);
	expect(node.x).toBe(250);
	expect(onComplete).toHaveBeenCalledTimes(1);
});
