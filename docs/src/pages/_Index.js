import React, { useState, useEffect } from 'react';
import { QueryParamProvider, useQueryParam, StringParam, BooleanParam } from 'use-query-params';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useThemeContext from '@theme/hooks/useThemeContext';
import Home from './_Home';
import Demo from './_Demo';

import { Vitessce } from '../../../dist/umd/production/index.min.js';

import { configs } from '../../../src/demo/configs';

import styles from './styles.module.css';

function ThemedVitessce(props) {
    const { isDarkTheme } = useThemeContext();
    return (
      <Vitessce
        theme={isDarkTheme ? "dark" : "light"}
        {...props}
      />
    );
}

function VitessceAppStyles() {
    return (
        <style>{`   
            .footer {
                display: none;
            }
            .navbar__item {
                opacity: 0.2;
                transition: opacity 0.25s;
            }
            .navbar:hover .navbar__item {
                opacity: 1;
            }
        `}</style>
    );
}


function IndexConsumer() {

    const editBaseUrl = useBaseUrl('/app/index.html?edit=1&url=');

    const [demo, setDemo] = useQueryParam('dataset', StringParam);
    const [debug, setDebug] = useQueryParam('debug', BooleanParam);
    const [url, setUrl] = useQueryParam('url', StringParam);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validConfig, setValidConfig] = useState(null);

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
 
                try {
                    const responseJson = JSON.parse(responseText);
                    // TODO: validate here.
                    setValidConfig(responseJson);
                    setError(null);
                } catch(e) {
                    setError({
                        title: "Error parsing JSON",
                        message: e.message,
                    });
                    setValidConfig(null);
                }
                
                setLoading(false);
              } else {
                setError({
                  title: "Fetch response not OK",
                  message: response.statusText,
                });
                setLoading(false);
                setValidConfig(null);
              }
            } catch(e) {
              setError({
                title: "Fetch error",
                message: e.message,
              });
              setLoading(false);
              setValidConfig(null);
            }
          } else if(demo && configs[demo]) {
            setValidConfig(configs[demo]); 
            setError(null);
            setLoading(false);
          } else {
            setValidConfig(null);
            setError(null);
            setLoading(false);
          }
        }
        processParams();
        return () => {
          unmounted = true;
        };
      }, [url, demo]);

    function handleEdit() {
        window.location.href = editBaseUrl + 'data:,' + encodeURIComponent(JSON.stringify(validConfig));
    }
    
    return (Object.keys(configs).includes(demo) ? (
        <Demo
            demo={demo}
            config={configs[demo]}
        />
      ) : (validConfig ? (
        <main className="vitessce-app">
            <VitessceAppStyles />
            <ThemedVitessce
                validateOnConfigChange={debug}
                onConfigChange={debug ? console.log : undefined}
                config={validConfig}
            />
            <div className={styles.vitessceClear}>
                <button
                    className={styles.vitessceClearButton}
                    onClick={handleEdit}>
                    Edit
                </button>
            </div>
        </main>
      ) : (
        <Home />
      )));
}

export default function Index() {
    return (
        <QueryParamProvider>
            <IndexConsumer />
        </QueryParamProvider>
    );
}
