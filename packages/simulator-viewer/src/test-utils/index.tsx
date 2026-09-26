import { PropsWithChildren } from 'react';
import { vi } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementType,
	FlowValueType,
	mapToOperatorPropsTemplate,
} from '@maklja/vision-simulator-model';
import { createRootStore, RootStore, StateProps, StoreContext } from '../store/rootStore';
import { ObservableEvent } from '../store/simulation';

export function createElement(
	type: ElementType,
	overrides: Partial<Omit<Element, 'type'>> = {},
): Element {
	const id = overrides.id ?? `${type}-element`;
	return {
		id,
		type,
		name: overrides.name ?? id,
		x: overrides.x ?? 0,
		y: overrides.y ?? 0,
		visible: overrides.visible ?? true,
		properties: overrides.properties ?? mapToOperatorPropsTemplate(type),
	};
}

export function createConnectLine(overrides: Partial<ConnectLine> = {}): ConnectLine {
	const id = overrides.id ?? 'connect-line';
	return {
		id,
		source: overrides.source ?? {
			id: 'source-element',
			connectPointType: ConnectPointType.Output,
			connectPosition: ConnectPointPosition.Right,
		},
		target: overrides.target ?? {
			id: 'target-element',
			connectPointType: ConnectPointType.Input,
			connectPosition: ConnectPointPosition.Left,
		},
		points: overrides.points ?? [
			{ x: 0, y: 0 },
			{ x: 10, y: 0 },
		],
		locked: overrides.locked ?? false,
		index: overrides.index ?? 1,
		name: overrides.name ?? id,
	};
}

export function createObservableEvent(overrides: Partial<ObservableEvent> = {}): ObservableEvent {
	const id = overrides.id ?? 'observable-event';
	return {
		id,
		type: overrides.type ?? FlowValueType.Next,
		hash: overrides.hash ?? `${id}-hash`,
		index: overrides.index ?? 0,
		connectLinesId: overrides.connectLinesId ?? [],
		sourceElementId: overrides.sourceElementId ?? 'source-element',
		targetElementId: overrides.targetElementId ?? 'target-element',
		value: overrides.value ?? '0',
		subscribeId: overrides.subscribeId ?? null,
		dependencies: overrides.dependencies ?? [],
	};
}

export function createTestStore(initProps?: Partial<StateProps>): RootStore {
	return createRootStore(initProps);
}

export function createStoreWrapper(store: RootStore) {
	return function StoreWrapper({ children }: PropsWithChildren) {
		return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
	};
}

export function spyOnConsole() {
	const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
	const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
	const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

	return {
		error,
		warn,
		log,
		restore: () => {
			error.mockRestore();
			warn.mockRestore();
			log.mockRestore();
		},
	};
}

export function enableFakeTimers() {
	vi.useFakeTimers();

	return () => {
		vi.clearAllTimers();
		vi.useRealTimers();
	};
}
