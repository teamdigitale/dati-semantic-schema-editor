# @teamdigitale/schema-editor

## 0.1.0

### Minor Changes

- 41e1a31: Updated schema-editor-utils semantic score response object and API output

### Patch Changes

- ad159cf: An error is raised when an invalid (not ending with /,#, or : ) prefix is used inside a JSON-LD context.
- fb74228: Added control that discards x-jsonld-context when passed as a string
- 2910eb0: Added warning message when a jsonld context property uses @id with a non string value
- d8fb254: Updated vite and vitest to solve vitest problems with url query param. Added a warning when an invalid oas is passed.
- Updated dependencies [08d6322]
- Updated dependencies [41e1a31]
- Updated dependencies [2910eb0]
- Updated dependencies [d8fb254]
  - @teamdigitale/schema-editor-utils@0.1.0

## 0.0.7

### Patch Changes

- acf57d7: Added API and created a new common package that includes both client/server functionalities for semantic score
- acf57d7: Created schema-editor-utils lib with common methods that can be used both on browser then node environemnts. Added api for schema semantic score calculation
- 15a95a8: New graph component that visualize semantic items
- 36c0140: help.md bundled as static asset
- Updated dependencies [acf57d7]
- Updated dependencies [acf57d7]
  - @teamdigitale/schema-editor-utils@0.0.2

## 0.0.6

### Patch Changes

- d90c8f5: Updated packages scope
