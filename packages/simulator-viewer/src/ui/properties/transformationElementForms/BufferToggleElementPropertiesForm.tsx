import Stack from '@mui/material/Stack';
import {
	BufferToggleElementProperties,
	bufferToggleOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { formStyle } from '../commonStyles';
import { SimpleCodeEditor } from '../../code';

export interface BufferToggleElementPropertiesFormProps {
	id: string;
	properties: BufferToggleElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function BufferToggleElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: BufferToggleElementPropertiesFormProps) {
	const handleClosingSelectorExpressionChanged = (closingSelectorExpression: string) =>
		onPropertyValueChange?.(id, 'closingSelectorExpression', closingSelectorExpression);

	return (
		<Stack
			sx={{
				gap: formStyle.componentGap,
			}}
		>
			<SimpleCodeEditor
				code={properties.closingSelectorExpression}
				label={bufferToggleOperatorDefinition.properties.closingSelectorExpression.label}
				helperText="A function that takes the value emitted by the openings observable and returns a Subscribable or Promise, which, when it emits, signals that the associated buffer should be emitted and cleared."
				onCodeChange={handleClosingSelectorExpressionChanged}
			/>
		</Stack>
	);
}
