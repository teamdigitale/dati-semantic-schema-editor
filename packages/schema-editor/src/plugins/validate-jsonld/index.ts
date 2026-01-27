import { validateJsonldContext } from './validators/validate-jsonld-context';

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
            const source = system.jsonldValidatorSelectors.errSource();
            system.errActions.clear({ source });
            system.errActions.newSpecErrBatch([
              // Insert here all validation functions
              ...(await validateJsonldContext(system)),
            ]);
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
