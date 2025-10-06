import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import next from 'eslint-config-next'

const eslintConfig = [
  {
    // Global ignores
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.min.js',
      '**/*.min.css',
      '**/public/**',
    ],
  },
  // Base JavaScript rules
  js.configs.recommended,
  // Next.js rules
  ...next.configs.recommended,
  // TypeScript-specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // TypeScript recommended rules
      ...typescript.configs.recommended.rules,
      // Custom rules
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      // Relax some strict TypeScript rules for better DX
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  // JavaScript files (non-TypeScript)
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
    },
  },
]

export default eslintConfig
