import js from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';

export default [
	{
		ignores: ['coverage/**', 'docs/**', 'packages/simulator-viewer/build/**'],
	},
	{
		files: ['packages/*/src/**/*.{ts,tsx}'],
		languageOptions: {
			parser: tseslintParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			'@typescript-eslint': tseslintPlugin,
			react: reactPlugin,
		},
		settings: {
			react: {
				version: '18.2',
			},
		},
		rules: {
			...js.configs.recommended.rules,
			// Keep ESLint's core correctness rules, but disable the core rules that
			// TypeScript-ESLint replaces with type-aware equivalents.
			...tseslintPlugin.configs['flat/eslint-recommended'].rules,
			...tseslintPlugin.configs.recommended.rules,
			...reactPlugin.configs.recommended.rules,
			...prettierConfig.rules,
			'react/react-in-jsx-scope': 'off',
		},
	},
];
