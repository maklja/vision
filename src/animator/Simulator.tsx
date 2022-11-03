import Konva from 'konva';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/rootState';
import { ResultDrawer } from '../drawers';
import { ConnectLine, Element } from '../model';
import { moveResultAnimation } from '../theme';
import { moveToNextObservableEvent, selectNextObservableEvent } from '../store/simulationSlice';
import { highlightElements } from '../store/stageSlice';

export interface SimulationEvent {
	connectLine: ConnectLine;
	sourceElement: Element;
	targetElement: Element;
}

export const Simulator = () => {
	const nextObservableEvent = useSelector(selectNextObservableEvent);
	const appDispatch = useAppDispatch();
	const [resultDrawerRef, setResultDrawerRef] = useState<Konva.Node | null>(null);

	useEffect(() => {
		if (!resultDrawerRef || !nextObservableEvent) {
			return;
		}

		const { connectLine } = nextObservableEvent;
		appDispatch(highlightElements([connectLine.sourceId]));

		const [, sourcePoint] = connectLine.points;
		const [targetPoint] = connectLine.points.slice(-2);

		resultDrawerRef.setPosition({ x: sourcePoint.x, y: sourcePoint.y });

		const animationControl = moveResultAnimation({
			targetPosition: targetPoint,
			sourcePosition: sourcePoint,
		})(resultDrawerRef);
		animationControl.addFinishListener(() => {
			appDispatch(highlightElements([connectLine.targetId ?? '']));
			appDispatch(moveToNextObservableEvent());
		});

		animationControl.play();
		return () => animationControl.destroy();
	}, [nextObservableEvent, resultDrawerRef]);

	if (!nextObservableEvent) {
		return null;
	}

	return <ResultDrawer ref={(ref) => setResultDrawerRef(ref)} />;
};
