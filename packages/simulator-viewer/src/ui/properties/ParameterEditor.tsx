import { StoreContext } from '../../store/rootStore';
import { useContext, useEffect, useRef, useState } from 'react';
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
	const store = useContext(StoreContext);
	const request = useRef(0);
	const mounted = useRef(false);
	const lastCommitted = useRef<{ serialized: string | undefined } | null>(null);
	const report = (error: string) => store?.getState().setParameterDraftError(id, field, error);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			request.current++;
			store?.getState().setParameterDraftError(id, field, '');
		};
	}, [store, id, field]);

	// Invalidate pending work synchronously on each edit; effect cleanup alone is too late.
	const emit = (
		kind: 'literal' | 'expression',
		nextLiteral = literal,
		nextSource = source,
		commit = true,
	) => {
		const token = ++request.current;
		const publish = (candidate: unknown) => {
			if (!commit) return;
			lastCommitted.current = { serialized: JSON.stringify(candidate) };
			onChange?.(id, field, candidate);
		};
		if (kind === 'literal') {
			try {
				if (!(optional && nextLiteral === ''))
					validateParameterConstraint(elementType, field, nextLiteral, properties);
			} catch {
				const message = `Enter a valid ${type} value. ${help}`;
				setSyntaxError(message);
				report(message);
				return;
			}
			setSyntaxError('');
			report('');
			publish(
				optional && nextLiteral === '' ? undefined : { kind, type, value: nextLiteral },
			);
			return;
		}
		if (!nextSource.trim()) {
			setSyntaxError('Expression source is required.');
			report('Expression source is required.');
			return;
		}
		setSyntaxError('Checking expression…');
		report('Checking expression…');
		import('@maklja/vision-simulator-engine')
			.then(({ validateSource }) => {
				if (!mounted.current || token !== request.current) return;
				try {
					validateSource(
						{ id } as import('@maklja/vision-simulator-model').Element,
						field,
						nextSource,
						false,
					);
				} catch {
					const message = 'Enter a valid JavaScript value expression (at most 64 KiB).';
					setSyntaxError(message);
					report(message);
					return;
				}
				setSyntaxError('');
				report('');
				publish({ kind, type, source: nextSource });
			})
			.catch(() => {
				if (!mounted.current || token !== request.current) return;
				setSyntaxError('Expression validation could not load.');
				report('Expression validation could not load.');
			});
	};
	useEffect(() => {
		// A successful commit echo must not replace the other mode's local draft.
		if (lastCommitted.current && lastCommitted.current.serialized === JSON.stringify(value))
			return;
		if (isParameterValue(value) && value.kind === 'expression') {
			setMode('expression');
			setSource(value.source);
			emit('expression', literal, value.source, false);
		} else {
			const next =
				isParameterValue(value) && value.kind === 'literal' ? value.value : (value ?? '');
			setMode('literal');
			setLiteral(next);
			emit('literal', next, source, false);
		}
	}, [value]);
	const error = syntaxError;
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
