import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { formStyle } from '../commonStyles';
import { SimpleCodeEditor } from '../../code';
import { RangeElementProperties } from '../../../model';

export interface RangeElementPropertiesFormProps {
	id: string;
	properties: RangeElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const RangeElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: RangeElementPropertiesFormProps) => {
	const handlePreInputObservableCreation = (input: string) =>
		onPropertyValueChange?.(id, 'preInputObservableCreation', input.trim());

	return (
		<Stack gap={formStyle.componentGap}>
			<TextField
				id="range-el-start-prop"
				label="Start"
				value={properties.start}
				type="text"
				size="small"
				InputLabelProps={{
					shrink: true,
				}}
				onChange={(e) => onPropertyValueChange?.(id, 'start', e.target.value)}
				helperText="The value of the first integer in the sequence."
			/>

			<TextField
				id="range-el-count-prop"
				label="Count"
				value={properties.count}
				type="text"
				size="small"
				InputLabelProps={{
					shrink: true,
				}}
				onChange={(e) => onPropertyValueChange?.(id, 'count', e.target.value)}
				helperText="The number of sequential integers to generate."
			/>

			<SimpleCodeEditor
				code={properties.preInputObservableCreation}
				label="Pre code execution"
				helperText="Hook that will be executed before input observable is created."
				onCodeChange={handlePreInputObservableCreation}
			/>
		</Stack>
	);
};
