import { configureStore } from '@reduxjs/toolkit';
import drawersReducer from './drawersSlice';

const store = configureStore({
	reducer: { drawers: drawersReducer },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

