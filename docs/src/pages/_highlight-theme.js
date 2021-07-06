// A custom theme for JSON syntax highlighting
// component from prism-react-renderer.
export function getHighlightTheme(isDarkTheme) {
    return {
        "plain":{
            "color":(isDarkTheme ? "#dcdcdc" : "#393A34"),
            "backgroundColor":"#f6f8fa"
        },
        "styles":[
            {
                "types":["comment","prolog","doctype","cdata"],
                "style":{"color":"#999988","fontStyle":"italic"}
            },
            {
                "types":["namespace"],
                "style":{"opacity":0.7}
            },
            {
                "types":["string","attr-value"],
                "style":{"color":(isDarkTheme ? "#ce9178" : "#0451a5")}
            },
            {
                "types":["punctuation","operator"],
                "style":{"color":(isDarkTheme ? "#dcdcdc" : "#393A34")}
            },
            {
                "types":["entity","url","symbol","variable","constant","property","regex","inserted"],
                "style":{"color":(isDarkTheme ? "#9cdcfe" : "#e3116c")}
            },
            {
                "types":["boolean"],
                "style":{"color":(isDarkTheme ? "#ce9178" : "#0451a5")}
            },
            {
                "types":["number"],
                "style":{"color":(isDarkTheme ? "#aac593" : "#098658")}
            },
            {
                "types":["atrule","keyword","attr-name","selector"],
                "style":{"color":"#00a4db"}
            },
            {
                "types":["function","deleted","tag"],
                "style":{"color":"#d73a49"}
            },
            {
                "types":["function-variable"],
                "style":{"color":"#6f42c1"}
            },
            {
                "types":["tag","selector","keyword"],
                "style":{"color":(isDarkTheme ? "#ce9178" : "#00009f")}
            }
        ]
    };
}