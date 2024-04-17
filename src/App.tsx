import { useRef } from 'react';
import { Simulator } from './simulator';
import { createRootStore, StoreContext } from './store/rootStore';

function App() {
	const store = useRef(createRootStore()).current;
	return (
		<div>
			<StoreContext.Provider value={store}>
				<Simulator />
			</StoreContext.Provider>
		</div>
	);
}

export default App;
