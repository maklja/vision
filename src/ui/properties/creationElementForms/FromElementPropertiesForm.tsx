import { SyntheticEvent } from 'react';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { FromElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';
import { formStyle } from '../commonStyles';

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
	const handleObservableEventChange = (
		_event: SyntheticEvent<Element, Event>,
		checked: boolean,
	) => onPropertyValueChange?.(id, 'enableObservableEvent', checked);

	return (
		<Stack gap={formStyle.componentGap}>
			<FormControlLabel
				control={<Checkbox defaultChecked />}
				label="Observable event"
				onChange={handleObservableEventChange}
			/>

			{properties.enableObservableEvent ? (
				<SimpleCodeEditor
					code={properties.preInputObservableCreation}
					label="Pre code execution"
					helperText="Hook that will be executed each before input observable is created."
					onCodeChange={(input: string) =>
						onPropertyValueChange?.(id, 'preInputObservableCreation', input)
					}
				/>
			) : (
				<SimpleCodeEditor
					code={properties.input}
					label="Input"
					helperText="A subscription object, a Promise, an Observable-like, an Array, an iterable, or an array-like object to be converted."
					onCodeChange={(input: string) => onPropertyValueChange?.(id, 'input', input)}
				/>
			)}
		</Stack>
	);
};

