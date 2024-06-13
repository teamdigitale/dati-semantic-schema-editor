# Schema Editor

Italia OpenAPI Schema Editor npm package is a [SwaggerUI](https://github.com/swagger-api/swagger-ui) extension, developed upon [Swagger Editor](https://github.com/swagger-api/swagger-editor).

## Table of contents

- 📋 [Installation](#installation)
- 💻 [Usage](#usage)
- 📝 [Contributing](#contributing)
- ⚖️ [License](#license)

## Installation

```bash
npm install @italia/schema-editor
```

## Usage

The package can be used in 2 ways:

- as a react component with editor and operations panels
- as a SwaggerUI plugins collection to create custom layouts
- as an Ace editor theme

### Standalone component

```js
import { SchemaEditor } from '@italia/schema-editor';
import '@italia/schema-editor/dist/style.css';

function App() {
  // By omitting both params the editor will be loaded as empty
  const params = {
    url: 'https://raw.githubusercontent.com/samchungy/zod-openapi/master/examples/simple/openapi.yml', // OPTIONAL: an OpenAPI file url
    schema: '...', // OPTIONAL: an OpenAPI schema definition
  };

  return (
    <div className="app-container">
      <SchemaEditor {...params} />
    </div>
  );
}
```

### SwaggerUI plugins collection

This is an example of using only the right-column layout (without editor):

```js
import SwaggerUI from 'swagger-ui-react';
import { ErrorsPlugin, JSONSchema5Plugin, OverviewPlugin } from '@italia/schema-editor';
import '@italia/schema-editor/dist/style.css';

const CustomLayoutPlugin = () => ({
  components: {
    CustomLayout: ({ getComponent }) => getComponent('OverviewContainer', true),
  },
});

function App() {
  return (
    <SwaggerUI
      plugins={[ErrorsPlugin, JSONSchema5Plugin, OverviewPlugin, CustomLayoutPlugin]}
      layout={'CustomLayout'}
    />
  );
}
```

This is an example of using only the models tab:

```js
import SwaggerUI from 'swagger-ui-react';
import { OverviewPlugin } from '@italia/schema-editor';
import '@italia/schema-editor/dist/style.css';

function CustomLayout({ getComponent }) {
  const TabModels = getComponent('TabModels', true);
  return (
    <div>
      <h1>Preview of schema models only</h1>
      <TabModels />
    </div>
  );
}

const CustomLayoutPlugin = () => ({
  components: {
    CustomLayout,
  },
});

function App() {
  return <SwaggerUI plugins={[OverviewPlugin, CustomLayoutPlugin]} layout={'CustomLayout'} />;
}
```

### Ace editor theme

```js
import { EditorThemePlugin } from '@italia/schema-editor';

// Initialize ace editor before
EditorThemePlugin();
```

## Contributing

Please, see [CONTRIBUTING.md](CONTRIBUTING.md) for more details on:

- using [pre-commit](CONTRIBUTING.md#pre-commit);
- following the git flow and making good [pull requests](CONTRIBUTING.md#making-a-pr).

## License

BSD 3-Clause License © [LICENSE](LICENSE)
