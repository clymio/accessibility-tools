import { useUiStore } from '@/stores';
import { visuallyHidden } from '@mui/utils';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';
import { default as Editor } from 'react-ace';
import style from './Editor.module.scss';

const AceEditor = ({ value, name = 'editor', ariaLabel = '', mode = 'html', width = '100%', height = '15rem', onChange = () => {}, onLoad = () => {} }) => {
  const { colorMode } = useUiStore();
  return (
    <>
      <span style={visuallyHidden} id='editor-instructions'>
        Press Escape to exit the code editor. Press Shift + Escape to move to the previous field.
      </span>
      <div role='group' aria-label={ariaLabel} aria-describedby='editor-instructions'>
        <Editor
          className={style.aceEditor}
          aria-describedby='editor-instructions'
          mode={mode}
          width={width}
          height={height}
          theme={colorMode === 'light' ? 'github' : 'monokai'}
          onChange={onChange}
          name={name}
          value={value}
          setOptions={{
            useWorker: false
          }}
          editorProps={{
            $blocKScrolling: true
          }}
          onLoad={(editor) => {
            const container = editor.container;
            container.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                editor.blur();
                onLoad(e);
              }
            });
          }}
        />
      </div>
    </>
  );
};

export default AceEditor;
