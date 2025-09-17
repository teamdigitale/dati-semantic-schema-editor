import AceEditor from 'react-ace';
import { EditorThemePlugin } from '@teamdigitale/schema-editor';

import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

EditorThemePlugin();

export function AceTheme() {
  return (
    <div>
      <AceEditor theme="tomorrow_night_eighties" value="This is the new theme!" width="100%" />
    </div>
  );
}
