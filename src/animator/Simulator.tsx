import Konva from 'konva';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store/rootState';
import { ResultDrawer } from '../drawers';
import { createObservableSimulation } from '../engine';
import { ConnectLine, Element } from '../model';
import { AnimationControl, moveResultAnimation } from '../theme';
import { moveToNextObservableEvent, selectNextObservableEvent } from '../store/simulationSlice';

export interface SimulationEvent {
	connectLine: ConnectLine;
	sourceElement: Element;
	targetElement: Element;
}

export interface SimulatorProps {
	events: SimulationEvent[];
}

export const Simulator = (props: SimulatorProps) => {
	const nextObservableEvent = useSelector(selectNextObservableEvent);
	const appDispatch = useAppDispatch();
	const [circleRef, setCircleRef] = useState<Konva.Circle | null>(null);

	useEffect(() => {
		if (!circleRef || !nextObservableEvent) {
			return;
		}

		const { targetElement } = nextObservableEvent;
		const animationControl = moveResultAnimation(targetElement.x, targetElement.y)(circleRef);
		animationControl.addFinishListener(() => {
			appDispatch(moveToNextObservableEvent());
		});

		animationControl.play();
		return () => {
			animationControl.destroy();
		};
	}, [nextObservableEvent, circleRef]);

	if (!nextObservableEvent) {
		return null;
	}

	const { sourceElement } = nextObservableEvent;
	return (
		<ResultDrawer ref={(ref) => setCircleRef(ref)} x={sourceElement.x} y={sourceElement.y} />
	);
};

