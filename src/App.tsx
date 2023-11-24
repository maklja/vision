import { Simulator } from './simulator';
import {
	ElementType,
	FilterElement,
	FromElement,
	OfElement,
	Element,
	IntervalElement,
	CatchErrorElement,
	MapElement,
} from './model';
import { useEffect } from 'react';
import { loadElements } from './store/stageSlice';
import { useAppDispatch } from './store/rootState';

const e1: OfElement = {
	id: 'ofElement',
	name: 'ofElement',
	x: 50,
	y: 50,
	type: ElementType.Of,
	visible: true,
	properties: {
		itemsFactory: '() => [4, 3, 2, 1]',
	},
};

const e3: FromElement = {
	id: 'fromElement',
	name: 'fromElement',
	x: 50,
	y: 200,
	type: ElementType.From,
	visible: true,
	properties: {
		enableObservableEvent: true,
		input: '() => [1, 2, 3, 4]',
		preInputObservableCreation: '() => {}',
	},
};

const mapElement: MapElement = {
	id: 'mapElement',
	name: 'mapElement',
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
	name: 'intervalElement',
	x: 50,
	y: 300,
	type: ElementType.Interval,
	visible: true,
	properties: {
		period: '2000',
		preInputObservableCreation: '() => { $context.timerName = "my-timer" }',
	},
};

const e4: FilterElement = {
	id: 'filterElement',
	name: 'filterElement',
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
	name: 'filterElement_1',
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
	name: 'catchError_1',
	x: 82.5,
	y: 80,
	type: ElementType.CatchError,
	visible: true,
	properties: {},
};

const subscriber1: Element = {
	id: 'subscriber_0',
	name: 'subscriber_0',
	x: 680,
	y: 125,
	type: ElementType.Subscriber,
	visible: true,
	properties: {},
};

const subscriber2: Element = {
	id: 'subscriber_1',
	name: 'subscriber_1',
	x: 680,
	y: 325,
	type: ElementType.Subscriber,
	visible: true,
	properties: {},
};

const subscriber3: Element = {
	id: 'subscriber_2',
	name: 'subscriber_2',
	x: 780,
	y: 125,
	type: ElementType.Subscriber,
	visible: true,
	properties: {},
};

const subscriber4: Element = {
	id: 'subscriber_3',
	name: 'subscriber_3',
	x: 780,
	y: 325,
	type: ElementType.Subscriber,
	visible: true,
	properties: {},
};

const App = () => {
	const appDispatch = useAppDispatch();

	useEffect(() => {
		appDispatch(
			loadElements({
				elements: [
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
				],
			}),
		);
	}, []);

	return (
		<div>
			<Simulator />
		</div>
	);
};

export default App;
