import Paper from '@mui/material/Paper';
import SettingsIcon from '@mui/icons-material/Settings';
import { WindowShell } from '../ui/window';
import { OperatorPropertiesPanel } from '../ui/properties/OperatorPropertiesPanel';
import { useRootStore } from '../store/rootStore';
import { selectRelatedElementElements } from '../store/connectLines';
import { useShallow } from 'zustand/react/shallow';
import { CommonProps, ConnectPointType, Point } from '../model';

export function SimulatorProperties() {
	const selectedElement = useRootStore(
		useShallow((state) => {
			const selectedElementsCount = state.selectedElements.length;
			return selectedElementsCount === 1 ? state.elements[state.selectedElements[0]] : null;
		}),
	);
	const elementNames = useRootStore(
		useShallow((state) => {
			if (state.selectedElements.length !== 1) {
				return [];
			}
			const otherElements = { ...state.elements };
			delete otherElements[state.selectedElements[0]];
			return Object.values(otherElements).map((el) => el.name);
		}),
	);
	const moveElement = useRootStore((state) => state.moveElement);
	const updateElement = useRootStore((state) => state.updateElement);
	const updateElementProperty = useRootStore((state) => state.updateElementProperty);
	const removeElementConnectLines = useRootStore((state) => state.removeElementConnectLines);
	const updateConnectLine = useRootStore((state) => state.updateConnectLine);
	const selectedElementConnectLines = useRootStore(
		selectRelatedElementElements(selectedElement?.id ?? null),
		(prevState, state) => {
			if (prevState.length !== state.length) {
				return false;
			}

			return prevState.every(
				({ element, connectLine }, i) =>
					element === state[i].element && connectLine === state[i].connectLine,
			);
		},
	);

	const handleElementPositionChange = (id: string, position: Point) =>
		moveElement({
			id,
			x: position.x,
			y: position.y,
		});

	const handleElementNameChange = (id: string, name: string) =>
		updateElement({
			id,
			name,
		});

	function handleElementPropertyChange(id: string, propertyName: string, propertyValue: unknown) {
		updateElementProperty({
			id,
			propertyName,
			propertyValue,
		});

		if (propertyName === CommonProps.EnableObservableEvent && !propertyValue) {
			removeElementConnectLines({
				elementId: id,
				connectPointType: ConnectPointType.Event,
			});
		}
	}

	const handleConnectLineChanged = (id: string, changes: { index?: number; name?: string }) =>
		updateConnectLine({
			id,
			...changes,
		});

	return selectedElement ? (
		<WindowShell
			icon={<SettingsIcon color="inherit" />}
			title={`Element details: ${selectedElement.name}`}
			tooltip={selectedElement.name}
			showControlButtons={true}
			sx={{
				position: 'absolute',
				top: '15%',
				right: '10px',
				height: '70%',
				maxHeight: '70%',
			}}
		>
			<Paper
				elevation={0}
				sx={{
					width: '100%',
					height: '100%',
					overflow: 'auto',
				}}
			>
				<OperatorPropertiesPanel
					element={selectedElement}
					elementNames={elementNames}
					relatedElements={selectedElementConnectLines}
					onNameChange={handleElementNameChange}
					onPositionChange={handleElementPositionChange}
					onPropertyValueChange={handleElementPropertyChange}
					onConnectLineChange={handleConnectLineChanged}
				/>
			</Paper>
		</WindowShell>
	) : null;
}

