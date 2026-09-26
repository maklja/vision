import { useEffect, useState } from 'react';
import { Simulator } from './simulator';
import { createRootStore, RootStore, StoreContext } from './store/rootStore';
import { loadDiagram, reportDiagramLoadError, subscribeDiagramPersistence } from './persistence';

function App() {
	const [store, setStore] = useState<RootStore | null>(null);

	useEffect(() => {
		loadDiagram()
			.then((storeData) => {
				setStore(createRootStore(storeData));
			})
			.catch((error) => {
				reportDiagramLoadError(error);
				setStore(createRootStore());
			});
	}, []);

	useEffect(() => {
		if (!store) {
			return;
		}

		return subscribeDiagramPersistence(store);
	}, [store]);

	return (
		<div>
			{store ? (
				<StoreContext.Provider value={store}>
					<Simulator />
				</StoreContext.Provider>
			) : null}
		</div>
	);
}

export default App;
