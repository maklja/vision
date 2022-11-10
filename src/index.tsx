import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { setupStore } from './store/rootState';
import { ElementType, FilterElement, FromElement, OfElement, Element, ConnectLine } from './model';
import { StageState } from './store/stageSlice';
import { DrawerThemeContext, defaultTheme } from './theme';

const e1: OfElement = {
	id: 'ofElement',
	size: 1,
	x: 50,
	y: 50,
	items: [4, 3, 2, 1],
	type: ElementType.Of,
};

const e3: FromElement = {
	id: 'fromElement',
	size: 1,
	x: 50,
	y: 200,
	type: ElementType.From,
	input: [3, 2, 3, 4],
};

const e4: FilterElement = {
	id: 'filterElement',
	size: 1,
	x: 200,
	y: 125,
	type: ElementType.Filter,
	expression: 'function(val) { return val % 2 === 0; }',
};

const e5: FilterElement = {
	id: 'filterElement_1',
	size: 1,
	x: 300,
	y: 125,
	type: ElementType.Filter,
	expression: 'function(val) { return val % 2 === 0; }',
};

const e2: Element = {
	id: 'subscriber',
	size: 1,
	x: 450,
	y: 125,
	type: ElementType.Subscriber,
};

const cl1: ConnectLine = {
	id: 'test',
	locked: false,
	points: [
		{ x: 90, y: 90 },
		{ x: 143, y: 90 },
		{ x: 187, y: 165 },
		{ x: 240, y: 165 },
	],
	sourceId: 'ofElement',
	targetId: 'filterElement',
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	// <React.StrictMode>
	<Provider
		store={setupStore({
			stage: {
				elements: [e1, e2, e3, e4, e5],
				connectLines: [cl1],
				draftConnectLine: null,
				highlighted: [],
				highlightedConnectPoints: [],
				selected: [],
				state: StageState.Select,
			},
		})}
	>
		<DrawerThemeContext.Provider value={defaultTheme}>
			<App />
		</DrawerThemeContext.Provider>
	</Provider>,
	// </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

