import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import stageReducer from './stageSlice';
import simulationsSliceReducer from './simulationSlice';
import drawersSliceReducer, { drawerSlice, addDrawerSettings } from './drawersSlice';

const store = configureStore({
	reducer: {
		stage: stageReducer,
		simulations: simulationsSliceReducer,
		drawers: drawersSliceReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [addDrawerSettings.type],
				ignoredPaths: [drawerSlice.name],
			},
		}),
});

export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

