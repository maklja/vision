import Stack from '@mui/material/Stack';
import { OfElementProperties } from '../../../model';
import { SimpleCodeEditor } from '../../code';
import { formStyle } from '../commonStyles';

export interface OfElementPropertiesFormProps {
	id: string;
	properties: OfElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const OfElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: OfElementPropertiesFormProps) => {
	const handleItemsFactoryChange = (input: string) =>
		onPropertyValueChange?.(id, 'itemsFactory', input.trim());

	return (
		<Stack gap={formStyle.componentGap}>
			<SimpleCodeEditor
				code={properties.itemsFactory}
				label="Input"
				helperText="Factory used to create of operator input elements. of(...itemsFactory())"
				onCodeChange={handleItemsFactoryChange}
			/>
		</Stack>
	);
};

