import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	AjaxElementProperties,
	BufferCountElementProperties,
	BufferTimeElementProperties,
	CombineLatestElementProperties,
	ConnectLine,
	Element,
	ElementType,
	ExpandElementProperties,
	ForkJoinElementProperties,
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
	ForkJoinElementPropertiesForm,
	JoinCreationElementForm,
	MergeElementPropertiesForm,
} from './joinCreationElementForms';
import {
	BufferCountElementPropertiesForm,
	BufferTimeElementPropertiesForm,
	ExpandElementPropertiesForm,
} from './transformationElementForms';

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
		case ElementType.ForkJoin:
			return (
				<ForkJoinElementPropertiesForm
					id={id}
					properties={properties as ForkJoinElementProperties}
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
		case ElementType.Concat:
		case ElementType.Zip:
		case ElementType.Race:
			return (
				<JoinCreationElementForm
					id={id}
					relatedElements={relatedElements}
					onConnectLineChange={onConnectLineChange}
				/>
			);
		case ElementType.BufferCount:
			return (
				<BufferCountElementPropertiesForm
					id={id}
					properties={properties as BufferCountElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.BufferTime:
			return (
				<BufferTimeElementPropertiesForm
					id={id}
					properties={properties as BufferTimeElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Expand:
			return (
				<ExpandElementPropertiesForm
					id={id}
					properties={properties as ExpandElementProperties}
					onPropertyValueChange={onPropertyValueChange}
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
	const elementForm = createElementPropertiesForm({
		element,
		relatedElements,
		onPropertyValueChange,
		onConnectLineChange,
	});
	return elementForm ? (
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
				<AccordionDetails>{elementForm}</AccordionDetails>
			</Accordion>
		</Box>
	) : null;
};

