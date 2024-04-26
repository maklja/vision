import Stack from '@mui/material/Stack';
import { formStyle } from '../commonStyles';
import { CatchErrorElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';

export interface CatchErrorElementPropertiesFormProps {
	id: string;
	properties: CatchErrorElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function CatchErrorElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: CatchErrorElementPropertiesFormProps) {
	const handleSelectorExpressionChanged = (selectorExpression: string) =>
		onPropertyValueChange?.(id, 'selectorExpression', selectorExpression);

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.selectorExpression}
				label="Project"
				helperText={
					'A function that takes as arguments err, which is the error, and caught, which is the source observable, in case you\'d like to "retry" that observable by returning it again. Whatever observable is returned by the selector will be used to continue the observable chain.'
				}
				onCodeChange={handleSelectorExpressionChanged}
			/>
		</Stack>
	);
}

