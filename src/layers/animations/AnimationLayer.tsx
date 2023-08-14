import { useEffect, useRef } from 'react';
import { Layer } from 'react-konva';
import { useAppDispatch, useAppSelector } from '../../store/rootState';
import {
	ObservableEvent,
	addElement,
	removeElement,
	selectConnectLines,
	selectSimulation,
} from '../../store/stageSlice';
import { ElementType } from '../../model';
import { createAnimations } from './createAnimations';

export interface AnimationLayerProps {
	simulationId: string;
}

export const AnimationLayer = ({ simulationId }: AnimationLayerProps) => {
	const appDispatch = useAppDispatch();
	const simulationStep = useRef(0);
	const simulation = useAppSelector(selectSimulation);
	const connectLines = useAppSelector(selectConnectLines);

	useEffect(() => {
		// create result drawer for simulation
		appDispatch(
			addElement({
				id: simulationId,
				scale: 1,
				x: 0,
				y: 0,
				type: ElementType.Result,
				visible: false,
				properties: {},
			}),
		);

		return () => {
			// clean up result drawer from  simulation
			appDispatch(
				removeElement({
					id: simulationId,
				}),
			);
		};
	}, [simulationId]);

	useEffect(() => {
		if (!simulation) {
			return;
		}

		const { events } = simulation;
		if (events.length === 0 || events.length === simulationStep.current) {
			return;
		}

		// create simulation animations for each drawer that is affected by events
		const animations = events
			.slice(simulationStep.current)
			.reduce((group: (ObservableEvent | null)[][], currentEvent, i) => {
				// group simulation events by [previousEvent, currentEvent]
				// so you could determine if it required to show previous drawer animation
				const prevEvent = events[simulationStep.current + i - 1];
				if (!prevEvent) {
					return [...group, [null, currentEvent]];
				}

				return [...group, [prevEvent, currentEvent]];
			}, [])
			.flatMap((eventsPair) => createAnimations(eventsPair, connectLines, simulation.id));

		// queue simulation animations
		appDispatch(
			addSimulationAnimations({
				animations,
				simulationId: simulation.id,
			}),
		);
		simulationStep.current = events.length;
	}, [simulation?.events]);
	return <Layer></Layer>;
};
