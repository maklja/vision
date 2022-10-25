import Konva from 'konva';
import { Animation } from './Animation';

export const snapConnectPointAnimation: Animation = (node: Konva.Node) => {
	const tween = new Konva.Tween({
		node,
		duration: 0.2,
		fill: 'green',
		opacity: 1,
		scaleX: 1.4,
		scaleY: 1.4,
	});

	return {
		playAnimation: () => tween.play(),
		reverseAnimation: () => {
			console.log('reverse');
			tween.reset();
		},
		destroyAnimation: () => {
			tween.onFinish = () => {
				console.log('destroy');
				tween.reset();
				tween.destroy();
			};
		},
	};
};

