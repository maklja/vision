import Stack from '@mui/system/Stack';
import InputLabel from '@mui/material/InputLabel';
import { RelatedElements } from '../properties/ElementPropertiesForm';
import { ConnectPointType } from '../../model';
import { ObservableIndexedInputs } from './ObservableIndexedInputs';

export interface ObservableInputsOrderProps {
	relatedElements: RelatedElements;
	onConnectLineIndexChange?: (id: string, connectLineIndex: number) => void;
}

export const ObservableInputsOrder = ({
	relatedElements,
	onConnectLineIndexChange,
}: ObservableInputsOrderProps) => {
	return (
		<Stack gap={0.5}>
			<InputLabel shrink>Observable inputs order</InputLabel>

			<Stack gap={1.2}>
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
			</Stack>
		</Stack>
	);
};

