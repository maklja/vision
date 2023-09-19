import Stack from '@mui/material/Stack';
import { IifElementProperties } from '../../../model';
import { formStyle } from '../commonStyles';
import { SimpleCodeEditor } from '../../code';

export interface IifElementPropertiesFormProps {
	id: string;
	properties: IifElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const IifElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: IifElementPropertiesFormProps) => {
	const handleConditionExpressionChanged = (input: string) =>
		onPropertyValueChange?.(id, 'conditionExpression', input);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.conditionExpression}
				label="Condition"
				helperText="Condition which Observable should be chosen."
				onCodeChange={handleConditionExpressionChanged}
			/>
		</Stack>
	);
};

