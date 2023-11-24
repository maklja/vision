import Stack from '@mui/material/Stack';
import { ConcatMapElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';
import { formStyle } from '../commonStyles';

export interface DeferElementPropertiesFormProps {
	id: string;
	properties: ConcatMapElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const DeferElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: DeferElementPropertiesFormProps) => {
	const handlePreInputObservableCreation = (input: string) =>
		onPropertyValueChange?.(id, 'preInputObservableCreation', input.trim());

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.preInputObservableCreation}
				label="Pre code execution"
				helperText="Hook that will be executed before input observable is created."
				onCodeChange={handlePreInputObservableCreation}
			/>
		</Stack>
	);
};
