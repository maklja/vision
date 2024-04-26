import { useRef, useState } from 'react';
import type monaco from 'monaco-editor';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';
import InputLabel from '@mui/material/InputLabel';

export interface SimpleCodeEditorProps {
	code: string;
	label: string;
	helperText?: string;
	language?: string;
	height?: number | string;
	options?: { readOnly?: boolean };
	onCodeChange?: (newCodeValue: string) => void;
}

const editorStyles = {
	defaultBorderColor: 'rgba(0, 0, 0, 0.23)',
	hoverBorderColor: 'rgba(0, 0, 0, 0.7)',
	focusBorderColor: 'primary.main',
	defaultBorderWidth: '1px',
	focusBorderWidth: '2px',
};

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
	autoIndent: 'full',
	acceptSuggestionOnCommitCharacter: true,
	acceptSuggestionOnEnter: 'on',
	accessibilitySupport: 'auto',
	automaticLayout: true,
	codeLens: true,
	colorDecorators: true,
	contextmenu: true,
	cursorBlinking: 'blink',
	cursorSmoothCaretAnimation: 'off',
	cursorStyle: 'line',
	disableLayerHinting: false,
	disableMonospaceOptimizations: false,
	dragAndDrop: false,
	fixedOverflowWidgets: false,
	foldingStrategy: 'auto',
	fontLigatures: false,
	formatOnPaste: false,
	formatOnType: false,
	hideCursorInOverviewRuler: false,
	links: true,
	mouseWheelZoom: false,
	multiCursorMergeOverlapping: true,
	multiCursorModifier: 'alt',
	lineNumbers: 'off',
	glyphMargin: false,
	folding: false,
	lineDecorationsWidth: 0,
	lineNumbersMinChars: 0,
	overviewRulerBorder: false,
	overviewRulerLanes: 0,
	wrappingStrategy: 'advanced',
	minimap: {
		enabled: false,
	},
	suggestOnTriggerCharacters: true,
	wordBasedSuggestions: 'currentDocument',
	wordSeparators: '~!@#$%^&*()-=+[{]}|;:\'",.<>/?',
	wordWrap: 'on',
	wordWrapBreakAfterCharacters: '\t})]?|&,;',
	wordWrapBreakBeforeCharacters: '{([+',
	wordWrapColumn: 80,
	wrappingIndent: 'none',
	quickSuggestions: true,
	quickSuggestionsDelay: 100,
	readOnly: false,
	renderControlCharacters: false,
	renderFinalNewline: 'on',
	renderLineHighlight: 'all',
	renderWhitespace: 'none',
	revealHorizontalRightPadding: 30,
	roundedSelection: true,
	rulers: [],
	scrollBeyondLastColumn: 5,
	scrollBeyondLastLine: true,
	selectOnLineNumbers: true,
	selectionClipboard: true,
	selectionHighlight: true,
	showFoldingControls: 'mouseover',
	smoothScrolling: false,
};

export const SimpleCodeEditor = ({
	label,
	code,
	helperText,
	onCodeChange,
	height = '400px',
	language = 'javascript',
	options = {},
}: SimpleCodeEditorProps) => {
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

	const [hover, setHover] = useState<boolean>(false);
	const [focus, setFocus] = useState<boolean>(false);

	const handleEditorMount: OnMount = (editor) => {
		editorRef.current = editor;
	};

	const handleEditorChange: OnChange = (value) => onCodeChange?.(value ?? '');

	const handleEditorFocus = () => {
		setFocus(true);
		editorRef.current?.focus();
	};

	const handleEditorBlur = () => setFocus(false);

	const handleMouseEnter = () => setHover(true);

	const handleMouseLeave = () => setHover(false);

	const hoverBorderColor = hover
		? editorStyles.hoverBorderColor
		: editorStyles.defaultBorderColor;
	const borderColor = focus ? editorStyles.focusBorderColor : hoverBorderColor;
	const borderWidth = focus ? editorStyles.focusBorderWidth : editorStyles.defaultBorderWidth;

	return (
		<Box>
			<Box
				tabIndex={0}
				onFocus={handleEditorFocus}
				onBlur={handleEditorBlur}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				sx={{
					position: 'relative',
					cursor: 'text',
				}}
			>
				<Box
					sx={{
						position: 'absolute',
						top: '6px',
						left: 0,
						width: '100%',
						height: '100%',
						borderRadius: '4px',
						borderColor,
						borderWidth,
						borderStyle: 'solid',
					}}
				/>
				<InputLabel
					size="small"
					focused={focus}
					shrink={true}
					sx={{
						position: 'absolute',
						top: '0',
						left: '10px',
						zIndex: 1,
					}}
				>
					<span
						style={{
							padding: '0 8px',
							backgroundColor: '#fff',
						}}
					>
						{label}
					</span>
				</InputLabel>
				<Box
					sx={{
						padding: '17.5px 14px 16.5px',
					}}
				>
					<Editor
						onMount={handleEditorMount}
						options={{
							...editorOptions,
							...options,
						}}
						height={height}
						defaultLanguage={language}
						defaultValue={code}
						onChange={handleEditorChange}
					/>
				</Box>
			</Box>
			{helperText ? (
				<FormHelperText
					sx={{
						margin: '9px 14px 0',
					}}
				>
					{helperText}
				</FormHelperText>
			) : null}
		</Box>
	);
};

