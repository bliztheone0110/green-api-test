import eslintReact from '@eslint-react/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['*.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-arrow-callback': 'error',
      'prefer-object-has-own': 'error',
      'prefer-template': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      eslintReact.configs['strict-type-checked'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
      '@stylistic/jsx-max-props-per-line': ['error', { maximum: 1 }],
      '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'none' }],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      curly: ['error', 'multi-line', 'consistent'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'logical-assignment-operators': 'error',
      'no-alert': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-else-return': 'error',
      'no-eval': 'error',
      'no-implicit-coercion': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-param-reassign': 'error',
      'no-script-url': 'error',
      'no-trailing-spaces': ['error', { ignoreComments: false, skipBlankLines: false }],
      'no-useless-return': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      yoda: 'error',
    },
  },
])
