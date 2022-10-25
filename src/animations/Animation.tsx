import Konva from 'konva';
import { useEffect, useRef } from 'react';

export interface AnimationControls {
	playAnimation: () => void;
	reverseAnimation: () => void;
	destroyAnimation: () => void;
}

export type Animation = (node: Konva.Node) => AnimationControls;

export const useAnimation = (node: Konva.Node | null, animation?: Animation) => {
	const ref = useRef<AnimationControls>();

	useEffect(() => {
		if (!node || !animation) {
			ref.current?.destroyAnimation();
			return;
		}

		console.log('set');
		ref.current = animation(node);
	}, [node, animation]);

	console.log('return');
	return ref.current;
};

