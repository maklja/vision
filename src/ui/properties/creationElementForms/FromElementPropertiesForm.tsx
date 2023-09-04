import Stack from '@mui/material/Stack';
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

	return (
		<Stack gap={1.5}>
			<SimpleCodeEditor
				code={properties.input}
				label="Input"
				helperText="A subscription object, a Promise, an Observable-like, an Array, an iterable, or an array-like object to be converted."
				onCodeChange={handleInputChanged}
			/>
		</Stack>
	);
};

