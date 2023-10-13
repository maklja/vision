import Stack from '@mui/system/Stack';
import InputLabel from '@mui/material/InputLabel';
import { RelatedElements } from '../properties/ElementPropertiesForm';
import { ObservableNamedInputs } from './ObservableNamedInputs';
import { ConnectPointType, ObservableInputsType } from '../../model';
import { ObservableIndexedInputs } from './ObservableIndexedInputs';
import { ObservableInputsTypeSelect } from './ObservableInputsTypeSelect';

export interface ObservableInputsProps {
	observableInputsType: ObservableInputsType;
	relatedElements: RelatedElements;
	onObservableInputsTypeChange?: (observableInputsType: ObservableInputsType) => void;
	onConnectLineIndexChange?: (id: string, connectLineIndex: number) => void;
	onConnectLineNameChange?: (id: string, connectLineName: string) => void;
}

export const ObservableInputs = ({
	observableInputsType,
	relatedElements,
	onObservableInputsTypeChange,
	onConnectLineIndexChange,
	onConnectLineNameChange,
}: ObservableInputsProps) => {
	return (
		<Stack gap={0.5}>
			<InputLabel shrink>Observable inputs</InputLabel>

			<Stack gap={1.2}>
				<ObservableInputsTypeSelect
					value={observableInputsType}
					onChange={onObservableInputsTypeChange}
				/>

				{observableInputsType === ObservableInputsType.Object ? (
					<ObservableNamedInputs
						onConnectLineNameChange={onConnectLineNameChange}
						observableInputs={relatedElements
							.filter(
								({ connectLine }) =>
									connectLine.source.connectPointType === ConnectPointType.Event,
							)
							.map((relatedElement) => ({
								id: relatedElement.connectLine.id,
								connectLineName: relatedElement.connectLine.name,
								targetElementName: relatedElement.element.type,
							}))}
					/>
				) : null}

				{observableInputsType === ObservableInputsType.Array ? (
					<ObservableIndexedInputs
						onConnectLineIndexChange={onConnectLineIndexChange}
						observableInputs={relatedElements
							.filter(
								({ connectLine }) =>
									connectLine.source.connectPointType === ConnectPointType.Event,
							)
							.map((relatedElement) => ({
								id: relatedElement.connectLine.id,
								index: relatedElement.connectLine.index,
								name: relatedElement.element.type,
							}))}
					/>
				) : null}
			</Stack>
		</Stack>
	);
};

