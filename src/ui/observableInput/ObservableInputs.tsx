import Stack from '@mui/system/Stack';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { RelatedElements } from '../properties/ElementPropertiesForm';
import { ObservableNamedInputs } from './ObservableNamedInputs';
import { ConnectPointType, ObservableInputsType } from '../../model';
import { ObservableIndexedInputs } from './ObservableIndexedInputs';

export interface ObservableInputsProps {
	observableInputsType: ObservableInputsType;
	relatedElements: RelatedElements;
	onObservableInputsTypeChange?: (observableInputsType: ObservableInputsType) => void;
}

export const ObservableInputs = ({
	observableInputsType,
	relatedElements,
	onObservableInputsTypeChange,
}: ObservableInputsProps) => {
	const handleObservableInputsTypeChange = (event: SelectChangeEvent<ObservableInputsType>) =>
		onObservableInputsTypeChange?.(event.target.value as ObservableInputsType);

	return (
		<Stack gap={0.5}>
			<InputLabel shrink>Observable inputs</InputLabel>

			<Stack gap={1.2}>
				<FormControl fullWidth size="small">
					<InputLabel shrink id="observable-input-type">
						Observable input type
					</InputLabel>
					<Select
						labelId="observable-input-type"
						value={observableInputsType}
						label="Observable input type"
						onChange={handleObservableInputsTypeChange}
					>
						{Object.values(ObservableInputsType).map((observableInputType) => (
							<MenuItem key={observableInputType} value={observableInputType}>
								{observableInputType}
							</MenuItem>
						))}
					</Select>
					<FormHelperText>
						Type which will be used to pass observable inputs.
					</FormHelperText>
				</FormControl>

				{observableInputsType === ObservableInputsType.Object ? (
					<ObservableNamedInputs
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

