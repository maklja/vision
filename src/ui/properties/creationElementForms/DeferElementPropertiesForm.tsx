import Stack from '@mui/material/Stack';
import { DeferElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';
import { formStyle } from '../commonStyles';

export interface DeferElementPropertiesFormProps {
	id: string;
	properties: DeferElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function DeferElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: DeferElementPropertiesFormProps) {
	const handleInputChanged = (input: string) => onPropertyValueChange?.(id, 'input', input);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.observableFactory}
				label="Observable factory"
				helperText="The Observable factory function to invoke for each Observer that subscribes to the output Observable. May also return any ObservableInput, which will be converted on the fly to an Observable."
				onCodeChange={handleInputChanged}
			/>
		</Stack>
	);
}

