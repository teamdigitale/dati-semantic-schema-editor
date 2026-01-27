# Schema Editor

Italia OpenAPI Schema Editor npm package is a [SwaggerUI](https://github.com/swagger-api/swagger-ui) extension, developed upon [Swagger Editor](https://github.com/swagger-api/swagger-editor).

## Table of contents

- 📋 [Installation](#installation)
- 💻 [Usage](#usage)
- 📝 [Contributing](#contributing)
- ⚖️ [License](#license)

## Installation

First of all install peer dependencies for styles and swagger ui

```bash
npm install swagger-editor bootstrap-italia @fontsource/lora @fontsource/roboto-mono @fontsource/titillium-web
```

Then apply the downloaded css as below:

```js
import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import '@fontsource/titillium-web';
import '@fontsource/roboto-mono';
import '@fontsource/lora';

function App() {
  return <div>This is an example</div>;
}
```

Finally install @teamdigitale/schema-editor and use it like described in the next paragraph

```bash
npm install @teamdigitale/schema-editor
```

## Usage

The package can be used in 2 ways:

- as a react component with editor and operations panels
- as a SwaggerUI plugins collection to create custom layouts
- as an Ace editor theme

### Standalone component

```js
import { LayoutTypes, SchemaEditor } from '@teamdigitale/schema-editor';
import '@teamdigitale/schema-editor/dist/style.css';

function App() {
  // By omitting both params the editor will be loaded as empty
  const params = {
    url: 'https://raw.githubusercontent.com/teamdigitale/dati-semantic-schema-editor/refs/heads/main/apps/example/public/schemas/example-schema.oas3.yaml', // OPTIONAL: an OpenAPI file url
    spec: '...', // OPTIONAL: an OpenAPI schema definition (string or object)
    layout: LayoutTypes.EDITOR, // OPTIONAL: layout type (EDITOR or VIEWER), defaults to EDITOR
    oasCheckerUrl: '...', // OPTIONAL: URL for OAS Checker integration
    schemaEditorUrl: '...', // OPTIONAL: URL for Schema Editor integration
    sparqlUrl: '...', // OPTIONAL: SPARQL endpoint URL for semantic queries
    tabsList: ['Models', 'Graph', 'Information'], // OPTIONAL: array of tab IDs to show (order matters)
  };

  return (
    <div className="app-container">
      <SchemaEditor {...params} />
    </div>
  );
}
```

#### Configuring Tabs

The `tabsList` prop allows you to configure which tabs are displayed and in what order. If not provided, all tabs are shown in the default order.

**Available tab IDs:**
- `'Models'` - Data Models tab
- `'Information'` - Information tab
- `'Graph'` - Graph tab
- `'Help'` - Help tab

**Examples:**

```js
// Show only specific tabs in a custom order
<SchemaEditor tabsList={['Graph', 'Models']} {...otherProps} />

// Show all tabs in default order (same as omitting tabsList)
<SchemaEditor tabsList={['Models', 'Information', 'Graph', 'Help']} {...otherProps} />

// Show only one tab (navigation will be hidden if tabs.length <= 1)
<SchemaEditor tabsList={['Models']} {...otherProps} />
```

**Note:** The order of IDs in the `tabsList` array determines the order in which tabs appear. Tabs not included in the array will be hidden.

### View only component

```js
import { LayoutTypes, SchemaEditor } from '@teamdigitale/schema-editor';
import '@teamdigitale/schema-editor/dist/style.css';

function App() {
  // By omitting both params the editor will be loaded as empty
  const params = {
    url: 'https://raw.githubusercontent.com/ioggstream/draft-polli-restapi-ld-keywords/refs/heads/main/tests/test-context.oas3.yaml', // OPTIONAL: an OpenAPI file url
    spec: '...', // OPTIONAL: an OpenAPI schema definition (string or object)
    layout: LayoutTypes.VIEWER, // REQUIRED: set to VIEWER for view-only mode
    tabsList: ['Models', 'Graph'], // OPTIONAL: array of tab IDs to show
    schemaEditorUrl: '...', // OPTIONAL: URL for Schema Editor integration
  };

  return (
    <div className="app-container">
      <SchemaEditor {...params} />
    </div>
  );
}
```

### Ace editor theme

```js
import { EditorThemePlugin } from '@teamdigitale/schema-editor';

// Initialize ace editor before
EditorThemePlugin();
```

## Contributing

Please, see [CONTRIBUTING.md](CONTRIBUTING.md) for more details on:

- using [pre-commit](CONTRIBUTING.md#pre-commit);
- following the git flow and making good [pull requests](CONTRIBUTING.md#making-a-pr).

## License

BSD 3-Clause License © [LICENSE](LICENSE)
