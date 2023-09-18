import { Element, ElementType } from '../element';

export interface TimerElementProperties {
	startDue: number | Date;
	intervalDuration: number;
}

export interface TimerElement extends Element<TimerElementProperties> {
	type: ElementType.Timer;
}

export const timerElementPropsTemplate: TimerElementProperties = {
	startDue: 1_000,
	intervalDuration: -1,
};
