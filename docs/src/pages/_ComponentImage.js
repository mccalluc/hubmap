import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useThemeContext from '@theme/hooks/useThemeContext';

export default function ComponentImage(props) {
    const {
        alt = "",
        filename,
    } = props;
    const { isDarkTheme } = useThemeContext();
    const theme = (isDarkTheme ? "dark" : "light");
    return (
        <img src={useBaseUrl(`/img/components/${theme}/${filename}`)} alt={alt} title={alt} />
    );
}