import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { formStyle } from '../commonStyles';
import { MergeElementProperties } from '../../../model';
import { ObservableInputsOrder } from '../../observableInput';
import { RelatedElements } from '../ElementPropertiesForm';
import { handleNumberInputChanged } from '../utils';

export interface MergeElementPropertiesFormProps {
	id: string;
	properties: MergeElementProperties;
	relatedElements: RelatedElements;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
	onConnectLineChange?: (id: string, changes: { index?: number; name?: string }) => void;
}

export function MergeElementPropertiesForm({
	id,
	properties,
	relatedElements,
	onPropertyValueChange,
	onConnectLineChange,
}: MergeElementPropertiesFormProps) {
	return (
		<Stack gap={formStyle.componentGap}>
			<TextField
				id="merge-el-limit-concurrent-prop"
				label="Limit concurrent"
				value={properties.limitConcurrent}
				type="number"
				size="small"
				InputLabelProps={{
					shrink: true,
				}}
				onChange={handleNumberInputChanged(
					id,
					'limitConcurrent',
					properties.limitConcurrent,
					onPropertyValueChange,
				)}
				helperText="Limit number of concurrently subscribed observable inputs."
			/>

			<ObservableInputsOrder
				relatedElements={relatedElements}
				onConnectLineIndexChange={(id, index) => onConnectLineChange?.(id, { index })}
			/>
		</Stack>
	);
}

