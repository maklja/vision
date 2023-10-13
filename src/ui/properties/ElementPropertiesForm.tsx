import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	AjaxElementProperties,
	CombineLatestElementProperties,
	ConnectLine,
	Element,
	ElementType,
	FromElementProperties,
	GenerateElementProperties,
	IifElementProperties,
	IntervalElementProperties,
	MergeElementProperties,
	RangeElementProperties,
	ThrowErrorElementProperties,
	TimerElementProperties,
} from '../../model';
import {
	AjaxElementPropertiesForm,
	FromElementPropertiesForm,
	GenerateElementPropertiesForm,
	IifElementPropertiesForm,
	IntervalElementPropertiesForm,
	RangeElementPropertiesForm,
	ThrowErrorElementPropertiesForm,
	TimerElementPropertiesForm,
} from './creationElementForms';
import {
	CombineLatestElementPropertiesForm,
	MergeElementPropertiesForm,
} from './joinCreationElementForms';

export type RelatedElements = { connectLine: ConnectLine; element: Element }[];

export interface ElementPropertiesFormProps {
	element: Element;
	relatedElements: RelatedElements;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
	onConnectLineChange?: (id: string, changes: { index?: number; name?: string }) => void;
}

const createElementPropertiesForm = ({
	element,
	relatedElements,
	onPropertyValueChange,
	onConnectLineChange,
}: ElementPropertiesFormProps) => {
	const { id, type, properties } = element;
	switch (type) {
		case ElementType.Interval:
			return (
				<IntervalElementPropertiesForm
					id={id}
					properties={properties as IntervalElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.From:
			return (
				<FromElementPropertiesForm
					id={id}
					properties={properties as FromElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Range:
			return (
				<RangeElementPropertiesForm
					id={id}
					properties={properties as RangeElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.ThrowError:
			return (
				<ThrowErrorElementPropertiesForm
					id={id}
					properties={properties as ThrowErrorElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Ajax:
			return (
				<AjaxElementPropertiesForm
					id={id}
					properties={properties as AjaxElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Generate:
			return (
				<GenerateElementPropertiesForm
					id={id}
					properties={properties as GenerateElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Timer:
			return (
				<TimerElementPropertiesForm
					id={id}
					properties={properties as TimerElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.IIf:
			return (
				<IifElementPropertiesForm
					id={id}
					properties={properties as IifElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.CombineLatest:
			return (
				<CombineLatestElementPropertiesForm
					id={id}
					properties={properties as CombineLatestElementProperties}
					relatedElements={relatedElements}
					onPropertyValueChange={onPropertyValueChange}
					onConnectLineChange={onConnectLineChange}
				/>
			);
		case ElementType.Merge:
			return (
				<MergeElementPropertiesForm
					id={id}
					properties={properties as MergeElementProperties}
					relatedElements={relatedElements}
					onPropertyValueChange={onPropertyValueChange}
					onConnectLineChange={onConnectLineChange}
				/>
			);
		default:
			return null;
	}
};

export const ElementPropertiesForm = ({
	element,
	relatedElements,
	onPropertyValueChange,
	onConnectLineChange,
}: ElementPropertiesFormProps) => {
	return Object.keys(element.properties).length > 0 ? (
		<Box
			sx={{
				overflow: 'auto',
				maxHeight: '100%',
			}}
			component="form"
			noValidate
			autoComplete="off"
		>
			<Accordion disableGutters defaultExpanded={true}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography>Element properties</Typography>
				</AccordionSummary>
				<AccordionDetails>
					{createElementPropertiesForm({
						element,
						relatedElements,
						onPropertyValueChange,
						onConnectLineChange,
					})}
				</AccordionDetails>
			</Accordion>
		</Box>
	) : null;
};

