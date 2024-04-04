import Stack from '@mui/material/Stack';
import { IifElementProperties } from '../../../model';
import { formStyle } from '../commonStyles';
import { SimpleCodeEditor } from '../../code';

export interface IifElementPropertiesFormProps {
	id: string;
	properties: IifElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function IifElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: IifElementPropertiesFormProps) {
	const handleConditionExpressionChanged = (input: string) =>
		onPropertyValueChange?.(id, 'conditionExpression', input);

	const handleTrueCallbackExpressionChanged = (input: string) =>
		onPropertyValueChange?.(id, 'trueCallbackExpression', input);

	const handleFalseCallbackExpressionChanged = (input: string) =>
		onPropertyValueChange?.(id, 'falseCallbackExpression', input);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.conditionExpression}
				label="Condition"
				helperText="Condition which Observable should be chosen."
				onCodeChange={handleConditionExpressionChanged}
			/>

			<SimpleCodeEditor
				code={properties.trueCallbackExpression}
				label="True result"
				helperText="An Observable that will be subscribed if condition is true."
				onCodeChange={handleTrueCallbackExpressionChanged}
			/>

			<SimpleCodeEditor
				code={properties.trueCallbackExpression}
				label="False result"
				helperText="An Observable that will be subscribed if condition is false."
				onCodeChange={handleFalseCallbackExpressionChanged}
			/>
		</Stack>
	);
}

