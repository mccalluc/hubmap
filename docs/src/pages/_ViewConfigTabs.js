import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

const jsonPrefix = "  ...,\n  ";
const jsonSuffix = ",\n  ...";

const jsPrefix = "const vc = new VitessceConfig(\"My config\");\n";

export default function ViewConfigTabs(props) {
    const {
        json,
        js,
        forData = false,
        withJsonLink = false,
    } = props;

    const baseUrl = useBaseUrl('/app/index.html?edit=1&url=data:,');
    const jsonLink = baseUrl + encodeURIComponent(json);

    return (
        <>
            <div className={styles.viewConfigTabs}>
                <Tabs
                    defaultValue="json"
                    values={[
                        {label: 'JSON', value: 'json'},
                        {label: 'JS API', value: 'js'},
                    ]}
                >
                    <TabItem value="json">
                        <CodeBlock className="language-javascript">{(forData ? jsonPrefix : '') + json.trim() + (forData ? jsonSuffix : '')}</CodeBlock>
                    </TabItem>
                    <TabItem value="js">
                        <CodeBlock className="language-javascript">{(forData ? jsPrefix : '') + js.trim()}</CodeBlock>
                    </TabItem>
                </Tabs>
            </div>
            {withJsonLink ? (
                <a href={jsonLink}>Try it!</a>
            ) : null}
        </>
    );
}
