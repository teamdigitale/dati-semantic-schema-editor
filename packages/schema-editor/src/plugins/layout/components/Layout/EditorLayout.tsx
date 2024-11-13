import './_layout.scss';

import { Dropzone } from '../Dropzone/Dropzone';
import { SplitPane } from '../SplitPane';

export const EditorLayout = ({ specActions, getComponent }) => {
  const ConfigurationProvider = getComponent('ConfigurationProvider', true);
  const OverviewContainer = getComponent('OverviewContainer', true);
  const EditorContainer = getComponent('EditorContainer', true);

  const handleChange = (newYaml, origin = 'editor') => {
    specActions.updateSpec(newYaml, origin);
  };

  return (
    <ConfigurationProvider>
      <div className="schema-editor">
        <Dropzone onDrop={handleChange}>
          <SplitPane>
            <EditorContainer onChange={handleChange} />
            <OverviewContainer />
          </SplitPane>
        </Dropzone>
      </div>
    </ConfigurationProvider>
  );
};
