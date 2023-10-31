import Stack from '@mui/material/Stack';
import { ConcatMapElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';
import { formStyle } from '../commonStyles';

export interface ConcatMapElementPropertiesFormProps {
	id: string;
	properties: ConcatMapElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const ConcatMapElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: ConcatMapElementPropertiesFormProps) => {
	const handlePreInputObservableCreation = (input: string) =>
		onPropertyValueChange?.(id, 'preInputObservableCreation', input.trim());

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.preInputObservableCreation}
				label="Input"
				helperText="Hook that will be executed each before input observable is created."
				onCodeChange={handlePreInputObservableCreation}
			/>
		</Stack>
	);
};

