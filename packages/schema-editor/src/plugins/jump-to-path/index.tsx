/* eslint-disable react/display-name */
import { Icon } from 'design-react-kit';
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
          <a className="pointer" style={{ wordBreak: 'break-word' }}>
            <Original
              {...props}
              content={<Icon icon="it-pencil" size={props.size || 'sm'} title="Jump to definition" />}
            />
          </a>
        );
      },
    },
  };
};

export default JumpToPathOverridePlugin;
