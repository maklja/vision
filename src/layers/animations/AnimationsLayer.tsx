import { useEffect } from 'react';
import { Layer } from 'react-konva';
import { ElementType } from '../../model';
import { OperatorDrawer } from '../../operatorDrawers';
import { AnimationKey } from '../../animation';
import {
	MoveSimulationAnimation,
	selectSimulation,
	selectSimulationNextAnimation,
} from '../../store/simulation';
import { selectDrawerAnimationById } from '../../store/drawerAnimations';
import { useStore } from '../../store/rootState';

export const AnimationsLayer = () => {
	const simulation = useStore(selectSimulation);
	const nextAnimation = useStore(selectSimulationNextAnimation);
	const removeSimulationAnimation = useStore((state) => state.removeSimulationAnimation);
	const drawerAnimation = useStore(
		selectDrawerAnimationById(nextAnimation?.drawerId, nextAnimation?.id),
	);
	const addDrawerAnimation = useStore((store) => store.addDrawerAnimation);

	// track when current drawer animation is disposed in order to dequeue it
	useEffect(() => {
		if (!drawerAnimation?.dispose) {
			return;
		}

		removeSimulationAnimation(drawerAnimation.id);
	}, [drawerAnimation?.dispose]);

	useEffect(() => {
		if (!nextAnimation) {
			return;
		}

		const { drawerId, key, id, data } = nextAnimation;
		// start drawer animation
		addDrawerAnimation({
			animationId: id,
			drawerId,
			key,
			data,
		});
	}, [simulation.animationsQueue, nextAnimation?.id]);

	const moveAnimation =
		nextAnimation?.key === AnimationKey.MoveDrawer
			? (nextAnimation as MoveSimulationAnimation)
			: null;
	const sourcePosition = moveAnimation?.data?.sourcePosition ?? { x: 0, y: 0 };
	const hash = moveAnimation?.data?.hash ?? '';
	return (
		<Layer>
			<OperatorDrawer
				element={{
					id: simulation.id,
					name: ElementType.Result,
					x: sourcePosition.x,
					y: sourcePosition.y,
					type: ElementType.Result,
					visible: Boolean(moveAnimation),
					properties: {
						hash,
					},
				}}
				visibleConnectPoints={false}
				draggable={false}
			/>
		</Layer>
	);
};
