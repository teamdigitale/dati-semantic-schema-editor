/* eslint-disable react/display-name */
import { Button } from 'design-react-kit';
import { List } from 'immutable';
import { resolveSpecPathRefs } from './utils';

export const JumpToPathOverridePlugin = () => {
  return {
    statePlugins: {
      spec: {
        wrapSelectors: {
          bestJumpPath: (oriSelector, system) => (state, options: { path?: string; specPath: List<string> }) => {
            const specPathArray: string[] = resolveSpecPathRefs(system, options.specPath?.toJS() || []);
            return oriSelector({ path: options.path, specPath: specPathArray });
          },
        },
      },
    },
    wrapComponents: {
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
