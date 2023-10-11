import { ChangeEventHandler } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { formStyle } from '../commonStyles';
import { MergeElementProperties } from '../../../model';
import { ObservableInputs } from '../../observableInput';
import { RelatedElements } from '../ElementPropertiesForm';

export interface MergeElementPropertiesFormProps {
	id: string;
	properties: MergeElementProperties;
	relatedElements: RelatedElements;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const MergeElementPropertiesForm = ({
	id,
	properties,
	relatedElements,
	onPropertyValueChange,
}: MergeElementPropertiesFormProps) => {
	const handleLimitConcurrentChanged: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement
	> = (e) => {
		const newLimitConcurrentValue = Number(e.target.value);
		onPropertyValueChange?.(
			id,
			'limitConcurrent',
			isNaN(newLimitConcurrentValue) ? properties.limitConcurrent : newLimitConcurrentValue,
		);
	};

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
				onChange={handleLimitConcurrentChanged}
				helperText="Limit number of concurrently subscribed observable inputs."
			/>

			<ObservableInputs relatedElements={relatedElements} />
		</Stack>
	);
};
