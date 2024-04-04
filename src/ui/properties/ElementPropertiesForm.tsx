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
	BufferToggleElementProperties,
	BufferWhenElementProperties,
	CombineLatestElementProperties,
	ConcatMapElementProperties,
	ConnectLine,
	DeferElementProperties,
	Element,
	ElementType,
	ExhaustMapElementProperties,
	ExpandElementProperties,
	ForkJoinElementProperties,
	FromElementProperties,
	GenerateElementProperties,
	IifElementProperties,
	IntervalElementProperties,
	MapElementProperties,
	MergeElementProperties,
	MergeMapElementProperties,
	RangeElementProperties,
	ThrowErrorElementProperties,
	TimerElementProperties,
} from '../../model';
import {
	AjaxElementPropertiesForm,
	DeferElementPropertiesForm,
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
	BufferToggleElementPropertiesForm,
	BufferWhenElementPropertiesForm,
	ConcatMapElementPropertiesForm,
	ExhaustMapElementPropertiesForm,
	ExpandElementPropertiesForm,
	MapElementPropertiesForm,
	MergeMapElementPropertiesForm,
} from './transformationElementForms';

export type RelatedElements = { connectLine: ConnectLine; element: Element }[];

export interface ElementPropertiesFormProps {
	element: Element;
	relatedElements: RelatedElements;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
	onConnectLineChange?: (id: string, changes: { index?: number; name?: string }) => void;
}

function createElementPropertiesForm({
	element,
	relatedElements,
	onPropertyValueChange,
	onConnectLineChange,
}: ElementPropertiesFormProps) {
	const { id, type, properties } = element;
	switch (type) {
		case ElementType.Defer:
			return (
				<DeferElementPropertiesForm
					id={id}
					properties={properties as DeferElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
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
		case ElementType.BufferToggle:
			return (
				<BufferToggleElementPropertiesForm
					id={id}
					properties={properties as BufferToggleElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.BufferWhen:
			return (
				<BufferWhenElementPropertiesForm
					id={id}
					properties={properties as BufferWhenElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.ConcatMap:
			return (
				<ConcatMapElementPropertiesForm
					id={id}
					properties={properties as ConcatMapElementProperties}
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
		case ElementType.ExhaustMap:
			return (
				<ExhaustMapElementPropertiesForm
					id={id}
					properties={properties as ExhaustMapElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Map:
			return (
				<MapElementPropertiesForm
					id={id}
					properties={properties as MapElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.MergeMap:
			return (
				<MergeMapElementPropertiesForm
					id={id}
					properties={properties as MergeMapElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		default:
			return null;
	}
}

export function ElementPropertiesForm({
	element,
	relatedElements,
	onPropertyValueChange,
	onConnectLineChange,
}: ElementPropertiesFormProps) {
	const elementForm = createElementPropertiesForm({
		element,
		relatedElements,
		onPropertyValueChange,
		onConnectLineChange,
	});
	return elementForm ? (
		<Box component="form" noValidate autoComplete="off">
			<Accordion disableGutters defaultExpanded={true}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography>Element properties</Typography>
				</AccordionSummary>
				<AccordionDetails>{elementForm}</AccordionDetails>
			</Accordion>
		</Box>
	) : null;
}

