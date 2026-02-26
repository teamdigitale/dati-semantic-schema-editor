# @teamdigitale/schema-editor-utils

## 0.1.0

### Minor Changes

- 41e1a31: Updated schema-editor-utils semantic score response object and API output

### Patch Changes

- 08d6322: Fixed two-digits decimals in semantic score
- 2910eb0: Added warning message when a jsonld context property uses @id with a non string value
- d8fb254: Updated vite and vitest to solve vitest problems with url query param. Added a warning when an invalid oas is passed.

## 0.0.2

### Patch Changes

- acf57d7: Added API and created a new common package that includes both client/server functionalities for semantic score
- acf57d7: Created schema-editor-utils lib with common methods that can be used both on browser then node environemnts. Added api for schema semantic score calculation
