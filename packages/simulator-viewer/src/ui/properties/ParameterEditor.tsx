import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
	ElementType,
	ElementProps,
	NumericParameter,
	ParameterType,
	isParameterValue,
	validateParameterConstraint,
} from '@maklja/vision-simulator-model';

interface Props {
	id: string;
	field: string;
	label: string;
	value?: NumericParameter;
	type?: Extract<ParameterType, 'number' | 'date'>;
	elementType: ElementType;
	properties: ElementProps;
	optional?: boolean;
	help: string;
	onChange?: (id: string, field: string, value: unknown) => void;
}

/** Key by element/field/type at the call site so drafts never leak into another element. */
export function ParameterEditor({
	id,
	field,
	label,
	value,
	type = 'number',
	elementType,
	properties,
	optional,
	help,
	onChange,
}: Props) {
	const initialLiteral = isParameterValue(value)
		? value.kind === 'literal'
			? value.value
			: ''
		: (value ?? '');
	const [literal, setLiteral] = useState<unknown>(initialLiteral);
	const [source, setSource] = useState(
		isParameterValue(value) && value.kind === 'expression' ? value.source : '',
	);
	const [mode, setMode] = useState<'literal' | 'expression'>(
		isParameterValue(value) ? value.kind : 'literal',
	);
	const [syntaxError, setSyntaxError] = useState('');
	useEffect(() => {
		if (isParameterValue(value) && value.kind === 'expression') {
			setMode('expression');
			setSource(value.source);
		} else {
			setMode('literal');
			setLiteral(
				isParameterValue(value) && value.kind === 'literal' ? value.value : (value ?? ''),
			);
		}
	}, [value]);
	useEffect(() => {
		let current = true;
		setSyntaxError('');
		if (mode === 'expression') {
			import('@maklja/vision-simulator-engine')
				.then(({ validateSource }) => {
					try {
						validateSource(
							{ id } as import('@maklja/vision-simulator-model').Element,
							field,
							source,
							false,
						);
					} catch {
						if (current)
							setSyntaxError(
								'Enter a valid JavaScript value expression (at most 64 KiB).',
							);
					}
				})
				.catch(() => {
					if (current) setSyntaxError('Expression validation could not load.');
				});
		}
		return () => {
			current = false;
		};
	}, [id, field, source, mode]);
	let error = syntaxError;
	if (mode === 'literal' && !(optional && literal === '')) {
		try {
			validateParameterConstraint(elementType, field, literal, properties);
		} catch {
			error = `Enter a valid ${type} value. ${help}`;
		}
	}
	if (mode === 'expression' && !source.trim()) error = 'Expression source is required.';
	const emit = (kind: 'literal' | 'expression', nextLiteral = literal, nextSource = source) => {
		onChange?.(
			id,
			field,
			kind === 'expression'
				? { kind, type, source: nextSource }
				: optional && nextLiteral === ''
					? undefined
					: { kind, type, value: nextLiteral },
		);
	};
	return (
		<Stack sx={{ gap: 1 }}>
			<TextField
				select
				size="small"
				label={`${label} mode`}
				value={mode}
				onChange={(event) => {
					const next = event.target.value as 'literal' | 'expression';
					setMode(next);
					emit(next);
				}}
			>
				<MenuItem value="literal">Literal</MenuItem>
				<MenuItem value="expression">Expression</MenuItem>
			</TextField>
			{mode === 'expression' ? (
				<TextField
					size="small"
					label={`${label} expression`}
					value={source}
					multiline
					error={!!error}
					helperText={
						error ||
						'Value expression: $context is run-shared; $params contains frozen raw definitions. Explicit overrides bypass this expression.'
					}
					onChange={(event) => {
						setSource(event.target.value);
						emit('expression', literal, event.target.value);
					}}
				/>
			) : type === 'date' ? (
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DateTimeField
						size="small"
						label={label}
						value={typeof literal === 'number' ? dayjs(literal) : null}
						slotProps={{ textField: { error: !!error, helperText: error || help } }}
						onChange={(date) => {
							const next = date?.isValid() ? date.valueOf() : '';
							setLiteral(next);
							emit('literal', next);
						}}
					/>
				</LocalizationProvider>
			) : (
				<TextField
					size="small"
					label={label}
					type="number"
					value={literal}
					error={!!error}
					helperText={error || help}
					slotProps={{
						inputLabel: { shrink: true },
						htmlInput: {
							min:
								elementType === ElementType.Range && field === 'start'
									? undefined
									: field === 'intervalDuration'
										? -1
										: 0,
						},
					}}
					onChange={(event) => {
						const next = event.target.value === '' ? '' : Number(event.target.value);
						setLiteral(next);
						emit('literal', next);
					}}
				/>
			)}
		</Stack>
	);
}
