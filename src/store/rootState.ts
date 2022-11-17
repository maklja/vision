import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import stageReducer from './stageSlice';
import simulationsSliceReducer, {
	simulationsSlice,
	addNextObservableEvent,
} from './simulationSlice';
import drawersSliceReducer, { drawerSlice, addDrawerSettings } from './drawersSlice';

const rootReducer = combineReducers({
	stage: stageReducer,
	simulations: simulationsSliceReducer,
	drawers: drawersSliceReducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
	return configureStore({
		preloadedState,
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: {
					ignoredActions: [addDrawerSettings.type, addNextObservableEvent.type],
					ignoredPaths: [drawerSlice.name, simulationsSlice.name],
				},
			}),
	});
};

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

