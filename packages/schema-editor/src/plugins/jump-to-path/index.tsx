import { Button } from 'design-react-kit';
import { List } from 'immutable';
import { resolveSpecPathRefs } from '@teamdigitale/schema-editor-utils';

export const JumpToPathOverridePlugin = () => {
  return {
    statePlugins: {
      spec: {
        wrapSelectors: {
          bestJumpPath: (oriSelector, system) => (state, options: { path?: string; specPath: List<string> }) => {
            const specJson = system.specSelectors.specJson();
            const specPath = options.specPath?.toJS() || [];
            const resolvedSpecPath: string[] = resolveSpecPathRefs(specJson, specPath);
            return oriSelector({ path: options.path, specPath: resolvedSpecPath });
          },
        },
      },
    },
    wrapComponents: {
      // eslint-disable-next-line react/display-name
      JumpToPath: (Original, system) => (props) => {
        return (
          <Original
            content={
              <Button color="primary" size="xs" outline className="py-1 px-3">
                <h6 className="m-0">#</h6>
              </Button>
            }
            {...props}
          />
        );
      },
    },
  };
};

export default JumpToPathOverridePlugin;
