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

	const handleTruthyExpressionChanged = (input: string) =>
		onPropertyValueChange?.(id, 'truthyInputObservableCreation', input);

	const handleFalsyExpressionChanged = (input: string) =>
		onPropertyValueChange?.(id, 'falsyInputObservableCreation', input);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.conditionExpression}
				label="Condition"
				helperText="Condition which Observable should be chosen."
				onCodeChange={handleConditionExpressionChanged}
			/>

			<SimpleCodeEditor
				code={properties.truthyInputObservableCreation}
				label="Truthy code execution"
				helperText="Hook that will be executed before truthy observable is created."
				onCodeChange={handleTruthyExpressionChanged}
			/>

			<SimpleCodeEditor
				code={properties.falsyInputObservableCreation}
				label="Falsy code execution"
				helperText="Hook that will be executed before falsy observable is created."
				onCodeChange={handleFalsyExpressionChanged}
			/>
		</Stack>
	);
};
