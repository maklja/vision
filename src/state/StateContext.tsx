import { createContext, useContext } from 'react';
import { State } from './State';
import { EventTheme, stateTheme } from './themeState';

export interface StateValue {
	state: State;
	theme: EventTheme;
}

export const StageStateContext = createContext<StateValue>({
	state: State.Select,
	theme: stateTheme.select,
});

export const useStageState = () => useContext(StageStateContext);
