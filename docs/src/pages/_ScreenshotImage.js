import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useThemeContext from '@theme/hooks/useThemeContext';

export default function ScreenshotImage(props) {
    const {
        alt = "",
        filename,
    } = props;
    const { isDarkTheme } = useThemeContext();
    const theme = (isDarkTheme ? "dark" : "light");
    const baseUrl = useBaseUrl('/img/screenshots');
    return (
        <div>
            <img src={`${baseUrl}/${theme}/${filename}`} alt={alt} title={alt} />
            <h3 style={{ textAlign: 'center' }}>{alt}</h3>
        </div>
    );
}