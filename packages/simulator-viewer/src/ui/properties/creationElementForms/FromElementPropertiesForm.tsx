import { SyntheticEvent } from 'react';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FromElementProperties } from '@maklja/vision-simulator-model';
import Checkbox from '@mui/material/Checkbox';
import { SimpleCodeEditor } from '../../code';
import { formStyle } from '../commonStyles';

export interface FromElementPropertiesFormProps {
	id: string;
	properties: FromElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function FromElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: FromElementPropertiesFormProps) {
	const handleInputChanged = (input: string) =>
		onPropertyValueChange?.(
			id,
			properties.enableObservableEvent ? 'observableFactory' : 'inputCallbackExpression',
			input,
		);

	const handleObservableEventChange = (
		_event: SyntheticEvent<Element, Event>,
		checked: boolean,
	) => onPropertyValueChange?.(id, 'enableObservableEvent', checked);

	// TODO you have bug here that code doesn't switch
	const helperText = properties.enableObservableEvent
		? 'Creation of the observable.'
		: 'A subscription object, a Promise, an Observable-like, an Array, an iterable, or an array-like object to be converted.';
	const code = properties.enableObservableEvent
		? properties.observableFactory
		: properties.inputCallbackExpression;
	return (
		<Stack gap={formStyle.componentGap}>
			<FormControlLabel
				control={<Checkbox checked={properties.enableObservableEvent} />}
				label="Observable event"
				onChange={handleObservableEventChange}
			/>

			<SimpleCodeEditor
				code={code}
				label="Input"
				helperText={helperText}
				onCodeChange={handleInputChanged}
			/>
		</Stack>
	);
}
