import './_layout.scss';

import { SplitPane } from 'react-collapse-pane';
import { Dropzone } from '../Dropzone/Dropzone';

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
          <SplitPane
            split="vertical"
            resizerOptions={{
              css: {
                width: '5px',
                background: '#e6ecf2',
              },
              hoverCss: {
                width: '5px',
                background: '#e6ecf2',
              },
              grabberSize: '1.5rem',
            }}
          >
            <EditorContainer onChange={handleChange} />
            <OverviewContainer />
          </SplitPane>
        </Dropzone>
      </div>
    </ConfigurationProvider>
  );
};
