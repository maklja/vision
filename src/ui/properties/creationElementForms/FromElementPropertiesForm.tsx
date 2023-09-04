import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FromElementProperties } from '../../../model';
import type monaco from 'monaco-editor';
import Editor, { OnMount } from '@monaco-editor/react';
import InputLabel from '@mui/material/InputLabel';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useRef, useState } from 'react';
import { BoxProps, alpha, styled, useTheme } from '@mui/material';
import { hover } from '@testing-library/user-event/dist/hover';

export interface FromElementPropertiesFormProps {
	id: string;
	properties: FromElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

/* 
{
  "acceptSuggestionOnCommitCharacter": true,
  "acceptSuggestionOnEnter": "on",
  "accessibilitySupport": "auto",
  "autoIndent": false,
  "automaticLayout": true,
  "codeLens": true,
  "colorDecorators": true,
  "contextmenu": true,
  "cursorBlinking": "blink",
  "cursorSmoothCaretAnimation": false,
  "cursorStyle": "line",
  "disableLayerHinting": false,
  "disableMonospaceOptimizations": false,
  "dragAndDrop": false,
  "fixedOverflowWidgets": false,
  "folding": true,
  "foldingStrategy": "auto",
  "fontLigatures": false,
  "formatOnPaste": false,
  "formatOnType": false,
  "hideCursorInOverviewRuler": false,
  "highlightActiveIndentGuide": true,
  "links": true,
  "mouseWheelZoom": false,
  "multiCursorMergeOverlapping": true,
  "multiCursorModifier": "alt",
  "overviewRulerBorder": true,
  "overviewRulerLanes": 2,
  "quickSuggestions": true,
  "quickSuggestionsDelay": 100,
  "readOnly": false,
  "renderControlCharacters": false,
  "renderFinalNewline": true,
  "renderIndentGuides": true,
  "renderLineHighlight": "all",
  "renderWhitespace": "none",
  "revealHorizontalRightPadding": 30,
  "roundedSelection": true,
  "rulers": [],
  "scrollBeyondLastColumn": 5,
  "scrollBeyondLastLine": true,
  "selectOnLineNumbers": true,
  "selectionClipboard": true,
  "selectionHighlight": true,
  "showFoldingControls": "mouseover",
  "smoothScrolling": false,
  "suggestOnTriggerCharacters": true,
  "wordBasedSuggestions": true,
  "wordSeparators": "~!@#$%^&*()-=+[{]}|;:'\",.<>/?",
  "wordWrap": "off",
  "wordWrapBreakAfterCharacters": "\t})]?|&,;",
  "wordWrapBreakBeforeCharacters": "{([+",
  "wordWrapBreakObtrusiveCharacters": ".",
  "wordWrapColumn": 80,
  "wordWrapMinified": true,
  "wrappingIndent": "none"
}

*/

const RedditTextField = styled((props: BoxProps) => <Box {...props} />)(({ theme }) => ({
	'.MuiBox-root': {
		borderRadius: 4,
		padding: 1,
		backgroundColor: theme.palette.mode === 'light' ? '#F3F6F9' : '#1A2027',
		border: '1px solid',
		borderColor: theme.palette.mode === 'light' ? '#E0E3E7' : '#2D3843',
		transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
		'&:hover': {
			backgroundColor: 'transparent',
		},
		'&.Mui-focused': {
			backgroundColor: 'transparent',
			boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
			borderColor: theme.palette.primary.main,
		},
	},
}));

export const FromElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: FromElementPropertiesFormProps) => {
	const t = useTheme();
	t.palette.primary.main;
	console.log(t.palette);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

	const [hover, setHover] = useState<boolean>(false);
	const [focus, setFocus] = useState<boolean>(false);

	const handleEditorMount: OnMount = (editor) => {
		editorRef.current = editor;
	};

	const hoverBorderColor = hover ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.23)';
	const borderColor = focus ? 'primary.main' : hoverBorderColor;
	const borderWidth = focus ? '2px' : '1px';

	return (
		<Stack gap={1.5}>
			<TextField
				placeholder="MultiLine with rows: 2 and rowsMax: 4"
				multiline
				rows={2}
				maxRows={4}
				label="Test"
			/>

			<Box
				tabIndex={0}
				onFocus={() => {
					setFocus(true);
					editorRef.current?.focus();
				}}
				onBlur={() => setFocus(false)}
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				sx={{
					position: 'relative',
					cursor: 'text',
				}}
			>
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						lelf: 0,
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
					focused={true}
					shrink={true}
					sx={{
						position: 'absolute',
						top: '-8px',
						left: '15px',
						backgroundColor: 'white',
					}}
				>
					Test
				</InputLabel>
				<Box
					sx={{
						padding: '16.5px 14px',
					}}
				>
					<Editor
						onMount={handleEditorMount}
						options={{
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
							wordBasedSuggestions: true,
							wordSeparators: '~!@#$%^&*()-=+[{]}|;:\'",.<>/?',
							wordWrap: 'on',
							wordWrapBreakAfterCharacters: '\t})]?|&,;',
							wordWrapBreakBeforeCharacters: '{([+',
							wordWrapColumn: 80,
							wrappingIndent: 'none',
							quickSuggestions: true,
							quickSuggestionsDelay: 100,
						}}
						height="400px"
						defaultLanguage="javascript"
						defaultValue={properties.input}
					/>
				</Box>
			</Box>
		</Stack>
	);
};
