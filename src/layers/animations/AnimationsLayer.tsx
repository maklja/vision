import { useEffect } from 'react';
import { Layer } from 'react-konva';
import { useAppDispatch, useAppSelector } from '../../store/rootState';
import { addDrawerAnimation, removeSimulationAnimation } from '../../store/stageSlice';
import { ElementType } from '../../model';
import { OperatorDrawer } from '../../operatorDrawers';
import { AnimationKey } from '../../animation';
import {
	MoveSimulationAnimation,
	selectSimulation,
	selectSimulationNextAnimation,
} from '../../store/simulation';
import { selectDrawerAnimationById } from '../../store/drawerAnimations';

export const AnimationsLayer = () => {
	const appDispatch = useAppDispatch();
	const simulation = useAppSelector(selectSimulation);
	const nextAnimation = useAppSelector(selectSimulationNextAnimation);
	const drawerAnimation = useAppSelector(
		selectDrawerAnimationById(nextAnimation?.drawerId, nextAnimation?.id),
	);

	// track when current drawer animation is disposed in order to dequeue it
	useEffect(() => {
		if (!drawerAnimation?.dispose) {
			return;
		}

		appDispatch(removeSimulationAnimation({ animationId: drawerAnimation.id }));
	}, [drawerAnimation?.dispose]);

	useEffect(() => {
		if (!nextAnimation) {
			return;
		}

		const { drawerId, key, id, data } = nextAnimation;
		// start drawer animation
		appDispatch(
			addDrawerAnimation({
				animationId: id,
				drawerId,
				key,
				data,
			}),
		);
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
					scale: 1,
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
