import Konva from 'konva';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/rootState';
import { ConnectLineDrawer, ResultDrawer } from '../drawers';
import { ConnectLine, Element } from '../model';
import { moveResultAnimation } from '../theme';
import { moveToNextObservableEvent, selectNextObservableEvent } from '../store/simulationSlice';
import { hashToColor, invertColor } from './utils';
import { filter } from 'rxjs';
import { AnimationEventType } from '../animation';
import { selectStage } from '../store/stageSlice';
import { Layer } from 'react-konva';
import { createConnectLineElement } from '../factory';
import { DrawerLayer } from '../layers';

export interface SimulationEvent {
	connectLine: ConnectLine;
	sourceElement: Element;
	targetElement: Element;
}

export const Simulator = () => {
	const { elements, connectLines, draftConnectLine } = useSelector(selectStage);
	const nextObservableEvent = useSelector(selectNextObservableEvent);
	const appDispatch = useAppDispatch();
	const [resultDrawerRef, setResultDrawerRef] = useState<Konva.Node | null>(null);

	useEffect(() => {
		if (!resultDrawerRef || !nextObservableEvent) {
			return;
		}

		const { connectLine } = nextObservableEvent;
		const [, sourcePoint] = connectLine.points;
		const [targetPoint] = connectLine.points.slice(-2);

		resultDrawerRef.setPosition({ x: sourcePoint.x, y: sourcePoint.y });

		const animationControl = moveResultAnimation({
			targetPosition: targetPoint,
			sourcePosition: sourcePoint,
		})(resultDrawerRef);
		const subscription = animationControl
			.observable()
			.pipe(filter((event) => event.type === AnimationEventType.Finish))
			.subscribe(() => appDispatch(moveToNextObservableEvent()));

		animationControl.play();
		return () => {
			subscription.unsubscribe();
			animationControl.destroy();
		};
	}, [nextObservableEvent, resultDrawerRef]);

	// if (!nextObservableEvent) {
	// 	return null;
	// }

	// const resultColor = hashToColor(nextObservableEvent.hash);
	// const invertResultColor = invertColor(resultColor, false);
	// console.log(elements);
	return (
		<Layer>
			{connectLines.map((connectLine) => createConnectLineElement(connectLine))}
			{draftConnectLine ? (
				<ConnectLineDrawer
					key={draftConnectLine.id}
					id={draftConnectLine.id}
					points={draftConnectLine.points}
				/>
			) : null}
			<DrawerLayer />
			{/* <ResultDrawer
				ref={(ref) => setResultDrawerRef(ref)}
				fill={resultColor}
				stroke={invertResultColor}
			/> */}
		</Layer>
	);
};
