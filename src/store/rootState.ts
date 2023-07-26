import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import stageReducer, { addNextObservableEvent } from './stageSlice';
import drawerAnimationsSlice from './drawerAnimationsSlice';
import stageSlice from './stageSlice';

const rootReducer = combineReducers({
	stage: stageReducer,
	drawerAnimations: drawerAnimationsSlice,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
	return configureStore({
		preloadedState,
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: {
					ignoredActions: [addNextObservableEvent.type],
					ignoredPaths: [stageSlice.name],
				},
			}),
	});
};

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

