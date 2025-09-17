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
import { SchemaEditor } from '@teamdigitale/schema-editor';
import '@teamdigitale/schema-editor/dist/style.css';

function App() {
  // By omitting both params the editor will be loaded as empty
  const params = {
    url: 'https://raw.githubusercontent.com/samchungy/zod-openapi/master/examples/simple/openapi.yml', // OPTIONAL: an OpenAPI file url
    schema: '...', // OPTIONAL: an OpenAPI schema definition
    oasCheckerUrl: '...', // OPTIONAL
    schemaEditorUrl: '...', // OPTIONAL
    sparqlUrl: '...', // OPTIONAL
  };

  return (
    <div className="app-container">
      <SchemaEditor {...params} />
    </div>
  );
}
```

### View only component

```js
import { LayoutTypes, SchemaEditor } from '@teamdigitale/schema-editor';
import '@teamdigitale/schema-editor/dist/style.css';

function App() {
  // By omitting both params the editor will be loaded as empty
  const params = {
    url: 'https://raw.githubusercontent.com/ioggstream/draft-polli-restapi-ld-keywords/refs/heads/main/tests/test-context.oas3.yaml', // OPTIONAL: an OpenAPI file url
    schema: '...', // OPTIONAL: an OpenAPI schema definition
  };

  return (
    <div className="app-container">
      <SchemaEditor layout={LayoutTypes.VIEWER} {...params} />
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
