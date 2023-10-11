import Stack from '@mui/system/Stack';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { RelatedElements } from '../properties/ElementPropertiesForm';
import { ObservableNamedInputs } from './ObservableNamedInputs';
import { ConnectPointType } from '../../model';
import { ObservableIndexedInputs } from './ObservableIndexedInputs';

export interface ObservableInputsProps {
	relatedElements: RelatedElements;
}

export const ObservableInputs = ({ relatedElements }: ObservableInputsProps) => {
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
						value={properties.method}
						label="Observable input type"
						onChange={handleMethodChanged}
					>
						{Object.values(HttpMethod).map((httpMethod) => (
							<MenuItem key={httpMethod} value={httpMethod}>
								{httpMethod}
							</MenuItem>
						))}
					</Select>
					<FormHelperText>
						Type which will be used to pass observable inputs.
					</FormHelperText>
				</FormControl>

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
			</Stack>
		</Stack>
	);
};
