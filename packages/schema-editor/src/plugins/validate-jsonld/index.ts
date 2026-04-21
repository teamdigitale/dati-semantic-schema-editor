import { validateJsonldContext } from '@teamdigitale/schema-editor-utils';

export const JSONLDValidatorPlugin = () => {
  return {
    statePlugins: {
      // Creates a new namespace for jsonld validator plugin
      jsonldValidator: {
        selectors: {
          errSource: () => 'JsonLD Validator',
        },
        actions: {
          validate: () => async (system) => {
            // Clear previous errors
            const source = system.jsonldValidatorSelectors.errSource();
            system.errActions.clear({ source });

            // Validate jsonld context
            const specJson = system.specSelectors.specJson();
            let issues = await validateJsonldContext(specJson);
            issues = issues.map((error) => ({
              ...error,
              line: system.specSelectors.getSpecLineFromPath(error.path),
              source: system.jsonldValidatorSelectors.errSource(),
            }));

            // Add new errors
            system.errActions.newSpecErrBatch(issues);
          },
        },
      },
      // Wraps spec plugin to enable jsonld validation
      spec: {
        wrapActions: {
          validateSpec:
            (ori, system) =>
            (...args) => {
              ori(...args);
              system.jsonldValidatorActions.validate();
            },
        },
      },
    },
  };
};

export default JSONLDValidatorPlugin;
