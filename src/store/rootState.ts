import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import stageReducer from './stageSlice';

const store = configureStore({
	reducer: { stage: stageReducer },
});

export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
