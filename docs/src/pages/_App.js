import React, { useCallback, useEffect, useState, useReducer } from 'react';
import Ajv from 'ajv';
import clsx from 'clsx';
import { QueryParamProvider, useQueryParam, StringParam, BooleanParam } from 'use-query-params';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useThemeContext from '@theme/hooks/useThemeContext';
import { useDropzone } from 'react-dropzone';
import ControlledEditor from './_ControlledEditor';
import { LiveProvider, LiveContext, LiveError, LivePreview } from 'react-live';
import Highlight, { defaultProps } from "prism-react-renderer";
import copy from 'copy-text-to-clipboard';
import {
  VitessceConfig, hconcat, vconcat,
  CoordinationType, Component, DataType, FileType,
} from '../../../dist/umd/production/index.min.js';

import configSchema from '../../../src/schemas/config-1.0.1.schema.json';
import cellSetsSchema from '../../../src/schemas/cell-sets.schema.json';
import rasterSchema from '../../../src/schemas/raster.schema.json';

import { getHighlightTheme } from './_highlight-theme';
import { baseJs, baseJson, exampleJs, exampleJson } from './_live-editor-examples';

import { configs } from '../../../src/demo/configs';

import styles from './styles.module.css';

const JSON_TRANSLATION_KEY = 'vitessceJsonTranslation';

const validate = new Ajv()
      .addSchema(cellSetsSchema)
      .addSchema(rasterSchema)
      .compile(configSchema);


// To simplify the JS editor, the user only needs to write
// the inner part of the createConfig() function,
// because this code will wrap the user's code to
// return a React component for react-live.
function transformCode(code) {
  return `function vitessceConfigEditor() {
    function createConfig() {
      ${code}
    }
    const vcJson = createConfig();
    return (
      <Highlight json={vcJson} />
    );
  }`;
}

function ThemedControlledEditor(props) {
  const { isDarkTheme } = useThemeContext();
  return <ControlledEditor
    {...props}
    theme={(isDarkTheme ? "vs-dark" : "GitHub")}
    height="60vh"
    options={{
      fontSize: 14,
      minimap: {
        enabled: false,
      },
      contextmenu: false,
    }}
  />
}

function JsonHighlight(props) {
  const { json } = props;
  const { isDarkTheme } = useThemeContext();
  const highlightTheme = getHighlightTheme(isDarkTheme);
  const [showCopied, setShowCopied] = useState(false);

  const jsonCode = JSON.stringify(json, null, 2);
  
  const handleCopyCode = () => {
      copy(jsonCode);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
  };

  useEffect(() => {
    // Put the current translation on the window for easy retrieval.
    // There is probably a cleaner way to do this.
    window[JSON_TRANSLATION_KEY] = jsonCode;
  });
  
  // Adapted from https://github.com/FormidableLabs/prism-react-renderer/blob/master/README.md#usage
  return (
    <Highlight {...defaultProps} code={jsonCode} language="json" theme={highlightTheme}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <div className={styles.copyButtonContainer}>
          <pre className={clsx(className, styles.viewConfigPreviewJSCode)} style={style}>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
          <button
            type="button"
            aria-label="Copy code to clipboard"
            className={styles.copyButton}
            onClick={handleCopyCode}>
            {showCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </Highlight>
  );
}

const scope = {
  VitessceConfig: VitessceConfig,
  hconcat: hconcat,
  vconcat: vconcat,
  Component: Component,
  DataType: DataType,
  FileType: FileType,
  CoordinationType: CoordinationType,
  cm: Component,
  dt: DataType,
  ft: FileType,
  ct: CoordinationType,
  Highlight: JsonHighlight,
};

function AppConsumer() {
  const baseUrl = useBaseUrl('/index.html?url=');
  const [demo, setDemo] = useQueryParam('dataset', StringParam);
  const [url, setUrl] = useQueryParam('url', StringParam);
  const [edit, setEdit] = useQueryParam('edit', BooleanParam);
  const [i, increment] = useReducer(v => v+1, 1);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validConfig, setValidConfig] = useState(null);
  
  const [pendingConfig, setPendingConfig] = useState(baseJson);
  const [pendingUrl, setPendingUrl] = useState('');
  const [pendingFileContents, setPendingFileContents] = useState('');

  const [pendingJs, setPendingJs] = useState(baseJs);

  const [syntaxType, setSyntaxType] = useState('JSON');
  const [loadFrom, setLoadFrom] = useState('editor');


  const onDrop = useCallback(acceptedFiles => {
    if(acceptedFiles.length === 1) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const { result } = reader;
        setPendingFileContents(result);
        setLoadFrom('file');
      });
      reader.readAsText(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1});

  useEffect(() => {
    let unmounted = false;
    async function processParams() {
      if (url) {
        setLoading(true);
        try {
          const response = await fetch(url);
          if(unmounted) {
            return;
          }
          if(response.ok) {
            const responseText = await response.text();
            if(unmounted) {
              return;
            }
            if(edit) {
              // User wants to edit the URL-based config.
              try {
                // Ideally, this is valid JSON and we can
                // use JSON.stringify to add nice indentation.
                const responseJson = JSON.parse(responseText);
                setPendingConfig(JSON.stringify(responseJson, null, 2));
              } catch(e) {
                // However, this may be an invalid JSON object
                // so we can just let the user edit the unformatted string.
                setPendingConfig(responseText);
              }
              setError(null);
            }
            setLoading(false);
          } else {
            setError({
              title: "Fetch response not OK",
              message: response.statusText,
            });
            setLoading(false);
            setPendingConfig('{}');
          }
        } catch(e) {
          setError({
            title: "Fetch error",
            message: e.message,
          });
          setLoading(false);
          setPendingConfig('{}');
        }
      } else if(demo && configs[demo]) {
        setPendingConfig(JSON.stringify(configs[demo], null, 2));
        setError(null);
        setLoading(false);
      } else {
        setPendingConfig(baseJson);
        setError(null);
        setLoading(false);
      }
    }
    processParams();
    return () => {
      unmounted = true;
    };
  }, [url, edit, demo]);

  function validateConfig(nextConfig) {
    const valid = validate(JSON.parse(nextConfig));

    let failureReason = '';
    if (!valid) {
      failureReason = validate.errors;
    }
    return [valid, failureReason];
  }

  function handleEditorGo() {
    let nextUrl;
    if(loadFrom === 'editor') {
      let nextConfig = pendingConfig;
      if(syntaxType === "JS") {
        nextConfig = window[JSON_TRANSLATION_KEY];
      }
      nextUrl = 'data:,' + encodeURIComponent(nextConfig);

      const [valid, failureReason] = validateConfig(nextConfig);
      if(!valid) {
        setError(failureReason);
        return;
      }
    } else if(loadFrom === 'url') {
      nextUrl = pendingUrl;
    } else if(loadFrom === 'file') {
      nextUrl = 'data:,' + encodeURIComponent(pendingFileContents);
    }
    window.location.href = baseUrl + nextUrl;
  }

  function handleUrlChange(event) {
    setPendingUrl(event.target.value);
    setLoadFrom('url');
  }

  function handleSyntaxChange(event) {
    setSyntaxType(event.target.value);
  }

  function tryExample() {
    if(syntaxType === "JSON") {
      setPendingConfig(exampleJson);
    } else {
      setPendingJs(exampleJs);
    }
    setLoadFrom('editor');
  }

  function resetEditor() {
    if(syntaxType === "JSON") {
      setPendingConfig(baseJson);
    } else {
      setPendingJs(baseJs);
    }
  }

  const showReset = syntaxType === "JSON" && pendingConfig !== baseJson || syntaxType === "JS" && pendingJs !== baseJs;

  return (
      loading ? (
        <pre>Loading...</pre>
      ) : (
        <main className={styles.viewConfigEditorMain}>
          {error && <pre className={styles.vitessceAppLoadError}>{JSON.stringify(error, null, 2)}</pre>}
          <p className={styles.viewConfigEditorInfo}>
            To use Vitessce, enter a&nbsp;
            <a href={useBaseUrl('/docs/view-config-json/index.html')}>view config</a>
            &nbsp;using the editor below.
            &nbsp;<button onClick={tryExample}>Try an example</button>&nbsp;
            {showReset && <button onClick={resetEditor}>Reset the editor</button>}
          </p>
          <div className={styles.viewConfigEditorType}>
            <label>
              <select className={styles.viewConfigEditorTypeSelect} value={syntaxType} onChange={handleSyntaxChange}>
                <option value="JSON">JSON</option>
                <option value="JS">JS</option>
              </select>
            </label>
          </div>
          <div className={styles.viewConfigEditorInputsSplit}>
            <div className={styles.viewConfigEditor}>
              {syntaxType === "JSON" ? (
                <>
                  <ThemedControlledEditor
                    value={pendingConfig}
                    onChange={(value) => {
                      setPendingConfig(value);
                      setLoadFrom('editor');
                    }}
                    language="json"
                  />
                </>
              ) : (
                <div className={styles.viewConfigEditorPreviewJSSplit}>
                  <LiveProvider code={pendingJs} scope={scope} transformCode={transformCode}>
                    <LiveContext.Consumer>
                      {({ code, disabled, onChange }) => (
                        <div className={styles.viewConfigEditorJS}>
                          <ThemedControlledEditor
                            value={code}
                            onChange={(value) => {
                              setPendingJs(value);
                              setLoadFrom('editor');
                            }}
                            language="javascript"
                          />
                        </div>
                      )}
                    </LiveContext.Consumer>
                    <div className={styles.viewConfigPreviewErrorSplit}>
                      <p className={styles.livePreviewHeader}>Translation to JSON</p>
                      <div className={styles.viewConfigPreviewScroll}>
                        <LiveError className={styles.viewConfigErrorJS} />
                        <LivePreview className={styles.viewConfigPreviewJS} />
                      </div>
                    </div>
                  </LiveProvider>
                </div>
              )}
            </div>
            <div className={styles.viewConfigInputs}>
              <div className={styles.viewConfigInputUrlOrFile}>
                <p className={styles.viewConfigInputUrlOrFileText}>
                  Alternatively, provide a URL or drag &amp; drop a view config file.
                </p>
                <div className={styles.viewConfigInputUrlOrFileSplit}>
                  <input
                    type="text"
                    className={styles.viewConfigUrlInput}
                    placeholder="Enter a URL"
                    value={pendingUrl}
                    onChange={handleUrlChange}
                  />
                  <div {...getRootProps()} className={styles.dropzone}>
                    <input {...getInputProps()} className={styles.dropzoneInfo} />
                    {isDragActive ?
                      <span>Drop the file here ...</span> :
                      (pendingFileContents ? (
                        <span>Successfully read the file.</span>
                      ) : (
                      <span>Drop a file</span>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.viewConfigInputButton}>
                <button className={styles.viewConfigGo} onClick={handleEditorGo}>Load from {loadFrom}</button>
              </div>
            </div>
          </div>
        </main>
      )
  );
}

// Reference: https://github.com/pbeshai/use-query-params#usage
export default function App() {
  return(
    <QueryParamProvider>
      <AppConsumer />
    </QueryParamProvider>
  );
}
