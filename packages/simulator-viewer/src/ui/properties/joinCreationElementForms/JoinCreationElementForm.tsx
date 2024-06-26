import Stack from '@mui/material/Stack';
import { formStyle } from '../commonStyles';
import { ObservableInputsOrder } from '../../observableInput';
import { RelatedElements } from '../ElementPropertiesForm';

export interface JoinCreationElementFormProps {
	id: string;
	relatedElements: RelatedElements;
	onConnectLineChange?: (id: string, changes: { index?: number; name?: string }) => void;
}

export function JoinCreationElementForm({
	relatedElements,
	onConnectLineChange,
}: JoinCreationElementFormProps) {
	return (
		<Stack gap={formStyle.componentGap}>
			<ObservableInputsOrder
				relatedElements={relatedElements}
				onConnectLineIndexChange={(id, index) => onConnectLineChange?.(id, { index })}
			/>
		</Stack>
	);
}

