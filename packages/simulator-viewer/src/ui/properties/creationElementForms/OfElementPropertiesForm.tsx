import Stack from '@mui/material/Stack';
import { OfElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';
import { formStyle } from '../commonStyles';

export interface OfElementPropertiesFormProps {
	id: string;
	properties: OfElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function OfElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: OfElementPropertiesFormProps) {
	const handleArgsFactoryExpressionChanged = (argsFactoryExpression: string) =>
		onPropertyValueChange?.(id, 'argsFactoryExpression', argsFactoryExpression);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.argsFactoryExpression}
				label="Arguments factory"
				helperText="Factory that returns array of arguments you want to be emitted."
				onCodeChange={handleArgsFactoryExpressionChanged}
			/>
		</Stack>
	);
}

