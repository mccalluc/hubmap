import React, { useCallback } from 'react';
import MonacoEditor from 'react-monaco-editor';

function ControlledEditor(props) {
  const {
    onChange,
  } = props;

  const editorDidMount = useCallback((editor, monaco) => {
    editor.focus();
  }, []);

  const onChangeInternal = useCallback((newValue, e) => {
    onChange(newValue);
  });
  
  return (
    <MonacoEditor
      {...props}
      onChange={onChangeInternal}
      editorDidMount={editorDidMount}
    />
  );
}

export default ControlledEditor;