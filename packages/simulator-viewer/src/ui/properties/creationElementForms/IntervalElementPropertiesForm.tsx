import Stack from '@mui/material/Stack';
import {
	ElementType,
	IntervalElementProperties,
	intervalOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { ParameterEditor } from '../ParameterEditor';
import { formStyle } from '../commonStyles';

export interface IntervalElementPropertiesFormProps {
	id: string;
	properties: IntervalElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}
export function IntervalElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: IntervalElementPropertiesFormProps) {
	return (
		<Stack sx={{ gap: formStyle.componentGap }}>
			<ParameterEditor
				key={`${id}:period`}
				id={id}
				field="period"
				label={intervalOperatorDefinition.properties.period.label}
				value={properties.period}
				elementType={ElementType.Interval}
				properties={properties}
				optional={false}
				help="Milliseconds, finite and at least zero."
				onChange={onPropertyValueChange}
			/>
		</Stack>
	);
}
