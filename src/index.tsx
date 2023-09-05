import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { setupStore } from './store/rootState';
import {
	ElementType,
	FilterElement,
	FromElement,
	OfElement,
	Element,
	IntervalElement,
	CatchErrorElement,
	MergeElement,
	MapElement,
} from './model';
import { createStageInitialState } from './store/stageSlice';

const e1: OfElement = {
	id: 'ofElement',
	scale: 1,
	x: 50,
	y: 50,
	type: ElementType.Of,
	visible: true,
	properties: { items: [4, 3, 2, 1] },
};

const e3: FromElement = {
	id: 'fromElement',
	scale: 1,
	x: 50,
	y: 200,
	type: ElementType.From,
	visible: true,
	properties: {
		enableObservableEvent: true,
		input: '() => [1, 2, 3, 4]',
	},
};

const mapElement: MapElement = {
	id: 'mapElement',
	scale: 1,
	x: 80,
	y: 400,
	type: ElementType.Map,
	visible: true,
	properties: {
		expression: '(value) => { return value; }',
	},
};

const i1: IntervalElement = {
	id: 'intervalElement',
	scale: 1,
	x: 50,
	y: 300,
	type: ElementType.Interval,
	visible: true,
	properties: { period: 2_000 },
};

const e4: FilterElement = {
	id: 'filterElement',
	scale: 1,
	x: 200,
	y: 125,
	type: ElementType.Filter,
	visible: true,
	properties: {
		expression: `(value) => {
			return value % 2 === 0;
		}`,
	},
};

const e5: FilterElement = {
	id: 'filterElement_1',
	scale: 1,
	x: 500,
	y: 125,
	type: ElementType.Filter,
	visible: true,
	properties: {
		expression: `function(value) {
			if (value > 2) {
				throw new Error('Ups');
			}
	
			return value % 2 === 0; 
		}`,
	},
};

const ce1: CatchErrorElement = {
	id: 'catchError_1',
	scale: 1,
	x: 82.5,
	y: 80,
	type: ElementType.CatchError,
	visible: true,
	properties: {},
};

const subscriber1: Element = {
	id: 'subscriber_0',
	scale: 1,
	x: 680,
	y: 125,
	type: ElementType.Subscriber,
	visible: true,
	properties: {},
};

const subscriber2: Element = {
	id: 'subscriber_1',
	scale: 1,
	x: 680,
	y: 325,
	type: ElementType.Subscriber,
	visible: true,
	properties: {},
};

const subscriber3: Element = {
	id: 'subscriber_2',
	scale: 1,
	x: 780,
	y: 125,
	type: ElementType.Subscriber,
	visible: true,
	properties: {},
};

const subscriber4: Element = {
	id: 'subscriber_3',
	scale: 1,
	x: 780,
	y: 325,
	type: ElementType.Subscriber,
	visible: true,
	properties: {},
};

const merge1: MergeElement = {
	id: 'merge_1',
	scale: 1,
	x: 380,
	y: 800,
	type: ElementType.Merge,
	visible: true,
	properties: {},
};

const merge2: MergeElement = {
	id: 'merge_2',
	scale: 1,
	x: 480,
	y: 800,
	type: ElementType.Merge,
	visible: true,
	properties: {},
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<StrictMode>
		<Provider
			store={setupStore({
				stage: createStageInitialState([
					e1,
					subscriber1,
					subscriber2,
					subscriber3,
					subscriber4,
					e3,
					e4,
					e5,
					i1,
					ce1,
					mapElement,
					merge1,
					merge2,
				]),
			})}
		>
			<DndProvider backend={HTML5Backend}>
				<App />
			</DndProvider>
		</Provider>
	</StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
