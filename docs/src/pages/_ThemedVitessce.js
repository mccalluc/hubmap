import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useThemeContext from '@theme/hooks/useThemeContext';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function ThemedVitessce(props) {
    const { isDarkTheme } = useThemeContext();
    return (
      <BrowserOnly>
        {() => {
          const Vitessce = require('../../../dist/umd/production/index.min.js').Vitessce;
          return (<Vitessce
            theme={isDarkTheme ? "dark" : "light"}
            {...props}
            />);
        }}
      </BrowserOnly>
    );
}