import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import stageReducer from './stageSlice';
import simulationSliceReducer from './simulationSlice';

const store = configureStore({
	reducer: { stage: stageReducer, simulation: simulationSliceReducer },
});

export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

