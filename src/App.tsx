import { Simulator } from './simulator';
import { ElementType, FilterElement, Element, IntervalElement, MapElement } from './model';
import { useEffect } from 'react';
import { useStore } from './store/rootState';

const mapElement: MapElement = {
	id: 'mapElement',
	name: 'mapElement',
	x: 80,
	y: 400,
	type: ElementType.Map,
	visible: true,
	properties: {
		projectExpression: '(value) => { return value; }',
	},
};

const i1: IntervalElement = {
	id: 'intervalElement',
	name: 'intervalElement',
	x: 50,
	y: 300,
	type: ElementType.Interval,
	visible: true,
	properties: { period: 2_000 },
};

const e4: FilterElement = {
	id: 'filterElement',
	name: 'filterElement',
	x: 200,
	y: 125,
	type: ElementType.Filter,
	visible: true,
	properties: {
		predicateExpression: `(value) => {
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
		predicateExpression: `function(value) {
			if (value > 2) {
				throw new Error('Ups');
			}
	
			return value % 2 === 0; 
		}`,
	},
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

const App = () => {
	const load = useStore((state) => state.load);

	useEffect(() => {
		load([subscriber1, subscriber2, e4, e5, i1, mapElement]);
	}, []);

	return (
		<div>
			<Simulator />
		</div>
	);
};

export default App;
