import { Element, ElementType } from '../element';

export enum DueDateType {
	Milliseconds = 0,
	Date = 1,
}

export interface TimerElementProperties extends Record<string, unknown> {
	dueDateType: DueDateType;
	startDue: number;
	intervalDuration: number;
}

export interface TimerElement extends Element<TimerElementProperties> {
	type: ElementType.Timer;
}

export const timerElementPropsTemplate: TimerElementProperties = {
	dueDateType: DueDateType.Milliseconds,
	startDue: 1_000,
	intervalDuration: -1,
};

