import Stack from '@mui/material/Stack';
import { formStyle } from '../commonStyles';
import { CommonProps, ForkJoinElementProperties, ObservableInputsType } from '../../../model';
import { ObservableInputs } from '../../observableInput';
import { RelatedElements } from '../ElementPropertiesForm';

export interface ForkJoinElementPropertiesFormProps {
	id: string;
	properties: ForkJoinElementProperties;
	relatedElements: RelatedElements;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
	onConnectLineChange?: (id: string, changes: { index?: number; name?: string }) => void;
}

export const ForkJoinElementPropertiesForm = ({
	id,
	properties,
	relatedElements,
	onPropertyValueChange,
	onConnectLineChange,
}: ForkJoinElementPropertiesFormProps) => {
	const handleObservableInputsTypeChanged = (observableInputsType: ObservableInputsType) =>
		onPropertyValueChange?.(id, CommonProps.ObservableInputsType, observableInputsType);

	return (
		<Stack gap={formStyle.componentGap}>
			<ObservableInputs
				relatedElements={relatedElements}
				observableInputsType={properties.observableInputsType}
				onObservableInputsTypeChange={handleObservableInputsTypeChanged}
				onConnectLineNameChange={(id, name) => onConnectLineChange?.(id, { name })}
				onConnectLineIndexChange={(id, index) => onConnectLineChange?.(id, { index })}
			/>
		</Stack>
	);
};
