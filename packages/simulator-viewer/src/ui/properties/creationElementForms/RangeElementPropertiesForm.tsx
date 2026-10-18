import Stack from '@mui/material/Stack';
import {
	ElementType,
	RangeElementProperties,
	rangeOperatorDefinition,
} from '@maklja/vision-simulator-model';
import { ParameterEditor } from '../ParameterEditor';
import { formStyle } from '../commonStyles';

export interface RangeElementPropertiesFormProps {
	id: string;
	properties: RangeElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}
export function RangeElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: RangeElementPropertiesFormProps) {
	return (
		<Stack sx={{ gap: formStyle.componentGap }}>
			<ParameterEditor
				key={`${id}:start`}
				id={id}
				field="start"
				label={rangeOperatorDefinition.properties.start.label}
				value={properties.start}
				elementType={ElementType.Range}
				properties={properties}
				optional={false}
				help="Finite integer; negative values are allowed."
				onChange={onPropertyValueChange}
			/>
			<ParameterEditor
				key={`${id}:count`}
				id={id}
				field="count"
				label={rangeOperatorDefinition.properties.count.label}
				value={properties.count}
				elementType={ElementType.Range}
				properties={properties}
				optional={true}
				help="Nonnegative integer; empty preserves RxJS range(start) behavior."
				onChange={onPropertyValueChange}
			/>
		</Stack>
	);
}
