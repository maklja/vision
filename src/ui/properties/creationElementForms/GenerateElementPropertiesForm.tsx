import Stack from '@mui/material/Stack';
import { formStyle } from '../commonStyles';
import { SimpleCodeEditor } from '../../code';
import { GenerateElementProperties } from '../../../model';

export interface GenerateElementPropertiesFormProps {
	id: string;
	properties: GenerateElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const GenerateElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: GenerateElementPropertiesFormProps) => {
	const handleInitialStateChanged = (input: string) =>
		onPropertyValueChange?.(id, 'initialState', input);

	const handleConditionChanged = (input: string) =>
		onPropertyValueChange?.(id, 'condition', input);

	const handleIterateChanged = (input: string) => onPropertyValueChange?.(id, 'iterate', input);

	const handleResultSelectorChanged = (input: string) =>
		onPropertyValueChange?.(id, 'resultSelector', input);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.initialState}
				label="Initial state"
				onCodeChange={handleInitialStateChanged}
				height="200px"
			/>

			<SimpleCodeEditor
				code={properties.condition ?? ''}
				label="Condition"
				onCodeChange={handleConditionChanged}
				helperText="Condition to terminate generation (upon returning false)."
				height="200px"
			/>

			<SimpleCodeEditor
				code={properties.iterate ?? ''}
				label="Iterate"
				onCodeChange={handleIterateChanged}
				helperText="Iteration step function."
				height="200px"
			/>

			<SimpleCodeEditor
				code={properties.resultSelector}
				label="Result selector"
				onCodeChange={handleResultSelectorChanged}
				helperText="Selector function for results produced in the sequence."
				height="200px"
			/>
		</Stack>
	);
};

