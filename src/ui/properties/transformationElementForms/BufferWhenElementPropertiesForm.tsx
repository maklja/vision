import Stack from '@mui/material/Stack';
import { formStyle } from '../commonStyles';
import { BufferWhenElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';

export interface BufferWhenElementPropertiesFormProps {
	id: string;
	properties: BufferWhenElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const BufferWhenElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: BufferWhenElementPropertiesFormProps) => {
	const handleClosingSelectorExpressionChanged = (closingSelectorExpression: string) =>
		onPropertyValueChange?.(id, 'closingSelectorExpression', closingSelectorExpression);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.closingSelectorExpression}
				label="Closing selector"
				helperText="A function that takes no arguments and returns an Observable that signals buffer closure."
				onCodeChange={handleClosingSelectorExpressionChanged}
			/>
		</Stack>
	);
};

