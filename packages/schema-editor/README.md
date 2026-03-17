# Schema Editor

Italia OpenAPI Schema Editor npm package is a [SwaggerUI](https://github.com/swagger-api/swagger-ui) extension, developed upon [Swagger Editor](https://github.com/swagger-api/swagger-editor).

## Table of contents

- 📋 [Installation](#installation)
- 💻 [Usage](#usage)
- 🔤 [Autocomplete](#autocomplete)
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
    sparqlUrl: '...', // OPTIONAL: SPARQL endpoint URL for semantic queries (see [Autocomplete](#autocomplete))
    sparqlAutocompleteEnabled: false, // OPTIONAL: enable SPARQL-based autocomplete for x-jsonld-type, @vocab, etc. (default: false)
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

## Autocomplete

The editor provides semantic autocomplete for JSON-LD–related fields when a SPARQL endpoint is configured. Autocomplete is **off** by default; enable it by passing `sparqlAutocompleteEnabled: true` and a valid `sparqlUrl` to the `SchemaEditor` (or to your SwaggerUI config).

### Enabling autocomplete

```js
const params = {
  sparqlUrl: 'https://your-sparql-endpoint.example.com/sparql',
  sparqlAutocompleteEnabled: true,
  // ... other props (url, spec, layout, etc.)
};

<SchemaEditor {...params} />;
```

- **`sparqlUrl`** – URL of the SPARQL endpoint used to fetch ontologies, classes, and vocabularies. Required for autocomplete when `sparqlAutocompleteEnabled` is `true`.
- **`sparqlAutocompleteEnabled`** – When `true`, suggestions are loaded from the SPARQL endpoint; when `false`, a built-in list of ontologies and classes is used (no network calls).

### Using autocomplete with `x-jsonld-type`

The `x-jsonld-type` keyword is used in OpenAPI schemas to assign a JSON-LD type (semantic class) to a schema. Autocomplete works in **two steps**:

1. **Choose an ontology**  
   Place the cursor in the value of `x-jsonld-type` (empty or after the cursor) and trigger autocomplete (e.g. Ctrl+Space). You will see a list of **ontologies** (e.g. CPV, RPO, CLV, Learning). When SPARQL autocomplete is enabled, entries are labelled with “(load classes...)” to indicate that selecting one will load the next level.

2. **Choose a class inside that ontology**  
   After inserting or typing an ontology URI (e.g. `https://w3id.org/italia/onto/CPV/`), trigger autocomplete again. The editor will show **classes** belonging to that ontology (e.g. `Person`, `Alive`, `EducationLevel`). Pick one to complete the `x-jsonld-type` value.

**Example:** To set the type to the CPV class “Person”:

1. Under a schema, add `x-jsonld-type: ` and trigger autocomplete → select the CPV ontology (e.g. `https://w3id.org/italia/onto/CPV/`).
2. Trigger autocomplete again → select `Person` (or the full URI `https://w3id.org/italia/onto/CPV/Person`).

### Other autocomplete contexts

- **`x-jsonld-context`** – Suggests JSON-LD context keys (`@vocab`, `@base`, `@id`, `@type`, etc.) and common vocabulary prefixes (e.g. `skos`, `dcterms`, `rdfs`, `xsd`). For custom term keys, when the value is empty you get ontologies; when the value is an ontology URI you get **properties** from that ontology.
- **`@vocab`** (inside `x-jsonld-context`) – Suggests ontologies as default vocabulary.
- **`@base`** (inside `x-jsonld-context`) – Suggests controlled vocabularies (e.g. for classifications).
- other prefixes/properties (inside `x-jsonld-context`) – Suggests ontologies or properties inside an ontology.

## Contributing

Please, see [CONTRIBUTING.md](CONTRIBUTING.md) for more details on:

- using [pre-commit](CONTRIBUTING.md#pre-commit);
- following the git flow and making good [pull requests](CONTRIBUTING.md#making-a-pr).

## License

Apache License 2.0 © [LICENSE](LICENSE)
