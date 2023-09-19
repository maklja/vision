import Stack from '@mui/material/Stack';
import { ThrowErrorElementProperties } from '../../../model';
import { formStyle } from '../commonStyles';
import { SimpleCodeEditor } from '../../code';

export interface ThrowErrorElementPropertiesFormProps {
	id: string;
	properties: ThrowErrorElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const ThrowErrorElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: ThrowErrorElementPropertiesFormProps) => {
	const handleErrorOrErrorFactoryChanged = (input: string) =>
		onPropertyValueChange?.(id, 'errorOrErrorFactory', input);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.errorOrErrorFactory}
				label="Error factory"
				helperText="A factory function that will create the error instance that is pushed."
				onCodeChange={handleErrorOrErrorFactoryChanged}
			/>
		</Stack>
	);
};

