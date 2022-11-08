import Konva from 'konva';

export type Animation = (node: Konva.Node) => AnimationControl;

export type FinishListener = (animationControl: AnimationControl) => void;

export type DestroyListener = () => void;

export interface AnimationControl {
	get id(): number;
	play(): void;
	reset(): void;
	destroy(): void;
	addFinishListener(l: FinishListener): void;
	removeFinishListener(l: FinishListener): void;
	addDestroyListener(l: DestroyListener): void;
	removeDestroyListener(l: DestroyListener): void;
}

export class TweenAnimationControl {
	private readonly finishListeners: FinishListener[] = [];
	private readonly destroyListeners: DestroyListener[] = [];

	constructor(private readonly animationNode: Konva.Tween) {
		this.animationNode.onFinish = this.onFinish.bind(this);
	}

	get id() {
		return this.animationNode._id;
	}

	addFinishListener(l: FinishListener) {
		if (this.finishListeners.includes(l)) {
			return;
		}

		this.finishListeners.push(l);
	}

	removeFinishListener(l: FinishListener) {
		const lIdx = this.finishListeners.findIndex((curListener) => curListener === l);
		if (lIdx === -1) {
			return;
		}

		this.finishListeners.splice(lIdx, 1);
	}

	addDestroyListener(l: DestroyListener) {
		if (this.destroyListeners.includes(l)) {
			return;
		}

		this.destroyListeners.push(l);
	}

	removeDestroyListener(l: DestroyListener) {
		const lIdx = this.destroyListeners.findIndex((curListener) => curListener === l);
		if (lIdx === -1) {
			return;
		}

		this.destroyListeners.splice(lIdx, 1);
	}

	play() {
		this.animationNode.play();
	}

	reset() {
		this.animationNode.reset();
	}

	destroy() {
		this.onDestroy();
		this.destroyListeners.splice(0);
		this.finishListeners.splice(0);
		this.animationNode.destroy();
	}

	private onFinish() {
		this.finishListeners.forEach((l) => l(this));
	}

	private onDestroy() {
		this.destroyListeners.forEach((l) => l());
	}
}

export class AnimationControlGroup implements AnimationControl {
	constructor(private readonly animations: AnimationControl[]) {
		this.animations.forEach((a) => a.addFinishListener(this.onFinish));
	}

	get id(): number {
		throw new Error('Method not implemented.');
	}

	play(): void {
		this.animations.forEach((a) => a.play());
	}

	reset(): void {
		this.animations.forEach((a) => a.reset());
	}

	destroy(): void {
		this.animations.forEach((a) => a.destroy());
	}

	addFinishListener(l: FinishListener): void {
		throw new Error('Method not implemented.');
	}

	removeFinishListener(l: FinishListener): void {
		throw new Error('Method not implemented.');
	}

	addDestroyListener(l: DestroyListener): void {
		throw new Error('Method not implemented.');
	}

	removeDestroyListener(l: DestroyListener): void {
		throw new Error('Method not implemented.');
	}

	private onFinish(animationControl: AnimationControl) {
		// this.finishListeners.forEach((l) => l(this));
	}
}

export const groupAnimations = (...animations: AnimationControl[]) =>
	new AnimationControlGroup(animations);

