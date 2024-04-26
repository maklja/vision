import { get, set } from 'idb-keyval';
import { useEffect, useRef } from 'react';
import { shallow } from 'zustand/shallow';
import { Simulator } from './simulator';
import { createRootStore, StateProps, StoreContext } from './store/rootStore';
import { ConnectLine, Element } from './model';
import { CanvasState } from './store/stage';

const diagramId = 'test'; // TODO temp solution until multiple tabs are added
const storeData = await get<StateProps>(diagramId);
const rootStore = createRootStore(storeData);

function App() {
	const store = useRef(rootStore);
	useEffect(() => {
		const unsubscribe = store.current.subscribe<
			[Record<string, Element>, Record<string, ConnectLine>, CanvasState, string]
		>(
			(state) => [
				state.elements,
				state.connectLines,
				state.canvasState,
				state.themes.default.colors.id,
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
	}, [store.current]);

	return (
		<div>
			<StoreContext.Provider value={store.current}>
				<Simulator />
			</StoreContext.Provider>
		</div>
	);
}

export default App;

