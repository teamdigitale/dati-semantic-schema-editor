# Schema Editor

Italia OpenAPI Schema Editor is developed on [Swagger Editor](https://github.com/swagger-api/swagger-editor).

This repository uses [PNPM](https://pnpm.io) and [turborepo](https://turbo.build/) for packages management, and [changesets](https://github.com/changesets/changesets) for versioning and publishing.

<div align="center">

![Build Status](https://github.com/italia/schema-editor/actions/workflows/pages.yml/badge.svg)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

</div>

## Table of contents

- 💻 [Usage](#usage)
- 📋 [Development](#development)
- 📝 [Contributing](#contributing)
- ⚖️ [License](#license)

## Usage

### Usage with Docker

To launch the application, just run docker compose

- that will build and deploy the app - and
  open the browser

```bash
docker compose up -d app
open http://localhost:5000
```

### Local Usage

To use the Semantic Schema Editor all you need to do is installing the `@italia/schema-editor` plugin
and use the component in your application.

```typescript
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import '@fontsource/lora';
import '@fontsource/roboto-mono';
import '@fontsource/titillium-web';

import './App.scss';

import { SchemaEditor } from '@italia/schema-editor';
import '@italia/schema-editor/dist/style.css';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const schemaUrl = urlParams.get('url');

  return (
    <>
      <div className="app-container">
        <SchemaEditor
            url={schemaUrl}
            oasCheckerUrl={'https://italia.github.io/api-oas-checker/'}
            schemaEditorUrl={'Your URL here'}
        />
      </div>
    </>
  );
}

export default App;

```

This repository contains various usage examples:

- [apps/example/src/App.tsx](./apps/example/src/App.tsx) - Showcase webapp;
- [apps/example/src/components/standalone](./apps/example/src/components/standalone) - Standalone editor;
- [apps/example/src/components/swaggerui-plugins-collection](./apps/example/src/components/swaggerui-plugins-collection) - Use the SwaggerUI component only.

## Development

### Develop with docker

To start the development environment with docker, run the following command:

```bash
docker compose up -d dev
```

This will run a development environment based on the [dev.dockerfile](./dev.dockerfile) and will start the development server.

### Installation

Ensure to have installed [PNPM](https://pnpm.io/installation) package manager.

Install node modules by running

```bash
pnpm install
```

### Running

Then simply execute

```bash
pnpm dev
```

to start all packages in development mode.

### Versioning and publishing

When developing a new feature or performing a new bugfix the version of the package(s) must be increased.
In order to process this correctly perform the following steps:

- Run `pnpm changeset` in the root of app in order to create a markdown containing the changes.

- Commit the generated files that are inside `.changeset` folder

- When the changesets files reach the "baseBranch" (actually "main"), a github action will generate a new PR with updated packages versions. Review the PR and approve merge when ready to release a new version.

- Once the PR is merged into the baseBranch, a github action will publish packages automatically.

- If you want to build and publish a pre-release version before going to the main branch, then rebase the "next" branch to the needed commit from main branch.
  The github action will open a new PR with the "-next.X" tag. Once merged in the "next" branch it will publish the package(s) as described above.
  For more informations and an example have a look at:
  - https://changesets-docs.vercel.app/en/prereleases
  - https://github.com/changesets/action/issues/69#issuecomment-774909280
  - https://github.com/statelyai/xstate/pull/902

**Pay attention: never merge "next" branch into "main"!**

## Docker builds

To create images for the two webapps, run th following commands:

```bash
# Editor webapp
docker build . --target webapp --tag webapp:latest

# Showcase webapp
docker build . --target example --tag example:latest
```

## Contributing

Please, see [CONTRIBUTING.md](CONTRIBUTING.md) for more details on:

- using [pre-commit](CONTRIBUTING.md#pre-commit);
- following the git flow and making good [pull requests](CONTRIBUTING.md#making-a-pr).

## License

BSD 3-Clause License © [LICENSE](LICENSE)
