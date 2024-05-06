import { get, set } from 'idb-keyval';
import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { ConnectLine, Element } from '@maklja/vision-simulator-model';
import { Simulator } from './simulator';
import { createRootStore, RootStore, StateProps, StoreContext } from './store/rootStore';
import { CanvasState } from './store/stage';

const diagramId = 'test'; // TODO temp solution until multiple tabs are added

function App() {
	const [store, setStore] = useState<RootStore | null>(null);

	useEffect(() => {
		get<StateProps>(diagramId)
			.then((storeData) => {
				setStore(createRootStore(storeData));
			})
			.catch((error) => {
				console.error(`Failed to load data from database. ${error}`);
				setStore(createRootStore());
			});
	}, []);

	useEffect(() => {
		if (!store) {
			return;
		}

		const unsubscribe = store.subscribe<
			[Record<string, Element>, Record<string, ConnectLine>, CanvasState, string]
		>(
			(state) => [
				state.elements,
				state.connectLines,
				state.canvasState,
				state.theme.default.colors.id,
			],
			async (state) => {
				const [elements, connectLines, canvasState, themeId] = state;
				await set(diagramId, {
					elements: Object.values(elements),
					connectLines: Object.values(connectLines),
					canvasState: {
						x: canvasState.x,
						y: canvasState.y,
						scaleX: canvasState.scaleX,
						scaleY: canvasState.scaleY,
					},
					themeId,
				});
			},
			{
				equalityFn: shallow,
			},
		);
		return unsubscribe;
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
