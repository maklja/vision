import { SyntheticEvent } from 'react';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { FromElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';

export interface FromElementPropertiesFormProps {
	id: string;
	properties: FromElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const FromElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: FromElementPropertiesFormProps) => {
	const handleInputChanged = (input: string) => onPropertyValueChange?.(id, 'input', input);

	const handleObservableEventChange = (
		_event: SyntheticEvent<Element, Event>,
		checked: boolean,
	) => onPropertyValueChange?.(id, 'enableObservableEvent', checked);

	return (
		<Stack gap={1.5}>
			<FormControlLabel
				control={<Checkbox defaultChecked />}
				label="Observable event"
				onChange={handleObservableEventChange}
			/>

			{properties.enableObservableEvent ? null : (
				<SimpleCodeEditor
					code={properties.input}
					label="Input"
					helperText="A subscription object, a Promise, an Observable-like, an Array, an iterable, or an array-like object to be converted."
					onCodeChange={handleInputChanged}
				/>
			)}
		</Stack>
	);
};
