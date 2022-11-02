import Konva from 'konva';

export type Animation = (node: Konva.Node) => AnimationControl;

export type FinishListener = (animationControl: AnimationControl) => void;
export type DestroyListener = () => void;

export class AnimationControl {
	private readonly finishListeners: FinishListener[] = [];
	private readonly destroyListeners: DestroyListener[] = [];

	constructor(private readonly animationNode: Konva.Tween) {
		this.animationNode.onFinish = this.onFinish.bind(this);
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

