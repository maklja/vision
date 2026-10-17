import Stack from '@mui/material/Stack';
import {
	GenerateElementProperties,
	generateOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { formStyle } from '../commonStyles';
import { SimpleCodeEditor } from '../../code';

export interface GenerateElementPropertiesFormProps {
	id: string;
	properties: GenerateElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function GenerateElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: GenerateElementPropertiesFormProps) {
	const handleInitialStateChanged = (input: string) =>
		onPropertyValueChange?.(id, 'initialState', input);

	const handleConditionChanged = (input: string) =>
		onPropertyValueChange?.(id, 'condition', input);

	const handleIterateChanged = (input: string) => onPropertyValueChange?.(id, 'iterate', input);

	const handleResultSelectorChanged = (input: string) =>
		onPropertyValueChange?.(id, 'resultSelector', input);

	return (
		<Stack
			sx={{
				gap: formStyle.componentGap,
			}}
		>
			<SimpleCodeEditor
				code={properties.initialState}
				label={generateOperatorDefinition.properties.initialState.label}
				onCodeChange={handleInitialStateChanged}
				height="200px"
			/>

			<SimpleCodeEditor
				code={properties.condition ?? ''}
				label={generateOperatorDefinition.properties.condition.label}
				onCodeChange={handleConditionChanged}
				helperText="Condition to terminate generation (upon returning false)."
				height="200px"
			/>

			<SimpleCodeEditor
				code={properties.iterate ?? ''}
				label={generateOperatorDefinition.properties.iterate.label}
				onCodeChange={handleIterateChanged}
				helperText="Iteration step function."
				height="200px"
			/>

			<SimpleCodeEditor
				code={properties.resultSelector}
				label={generateOperatorDefinition.properties.resultSelector.label}
				onCodeChange={handleResultSelectorChanged}
				helperText="Selector function for results produced in the sequence."
				height="200px"
			/>
		</Stack>
	);
}
