import Konva from "konva";

export interface AnimationControls {
	play: () => void;
	reset: () => void;
	destroy: () => void;
}

export type Animation = (node: Konva.Node) => AnimationControls;
