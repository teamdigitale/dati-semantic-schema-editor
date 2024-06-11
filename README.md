# Base Cookiecutter repository

Python template repository including boilerplate workflows and CI.

```bash
.pre-commit-config.yaml
.github
└── workflows
.gitlab
└── issue_templates
└── merge_request_templates
.gitlab-ci.yaml
```

Delete unused folder after creating the repository.

## Creating a new project

The name of a new project should be descriptive and short.
The repository name should be in [kebab-case](https://it.wikipedia.org/wiki/Kebab_case), string, e.g., `python-cookiecutter`,
`api-onboarding`.
Avoid CamelCase or underscores: you can use them for OOP classes or properties.

## Contributing

Please, see [CONTRIBUTING.md](CONTRIBUTING.md) for more details on:

- using [pre-commit](CONTRIBUTING.md#pre-commit);
- following the git flow and making good [pull requests](CONTRIBUTING.md#making-a-pr).

## Using this repository

You can create new projects starting from this repository,
so you can use a consistent CI and checks for different projects.

Besides all the explanations in the [CONTRIBUTING.md](CONTRIBUTING.md) file, you can use the docker-compose file
(e.g. if you prefer to use docker instead of installing the tools locally)

```bash
docker-compose run pre-commit
```

## Testing github actions

Tune the Github pipelines in [.github/workflows](.github/workflows/).

To speed up the development, you can test the pipeline with [act](https://github.com/nektos/act).
Its installation is beyond the scope of this document.

To test the pipeline locally and ensure that secrets (e.g., service accounts and other credentials)
are correctly configured, use:

 ```bash
 # Run a specific job in the pipeline
 act -j test -s CI_API_TOKEN="$(cat gh-ci.json)" \
      -s CI_ACCOUNT=my-secret-account
 ```

## Testing gitlab-ci

Tune the Gitlab pipelines in [.gitlab-ci.yml](.gitlab-ci.yml).

To speed up the development, you can test the pipeline with gitlab-ci-local.
Its installation is beyond the scope of this document.

```bash
gitlab-ci-local --file .gitlab-ci.yaml super-linter
```
