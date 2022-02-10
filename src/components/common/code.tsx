import React from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { lioshi } from "react-syntax-highlighter/dist/esm/styles/hljs"

export function Code(props: {children: string}) {
	return <SyntaxHighlighter language="typescript" style={lioshi}>{props.children.trim()}</SyntaxHighlighter>
}