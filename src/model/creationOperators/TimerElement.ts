import { Element, ElementType } from '../element';

export enum DueDateType {
	Milliseconds = 0,
	Date = 1,
	Variable = 2,
}

export interface TimerElementProperties extends Record<string, unknown> {
	dueDateType: DueDateType;
	startDue: string;
	intervalDuration: string;
	preInputObservableCreation: string;
}

export interface TimerElement extends Element<TimerElementProperties> {
	type: ElementType.Timer;
}

export const timerElementPropsTemplate: TimerElementProperties = {
	dueDateType: DueDateType.Milliseconds,
	startDue: '1000',
	intervalDuration: '-1',
	preInputObservableCreation: '() => {}',
};
