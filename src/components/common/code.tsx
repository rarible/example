import React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { darcula, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism"

interface ICodeProps {
	children: string
	theme?: "dark" | "light"
	language?: string
	wrap?: boolean
}
export function Code({ children, theme, language, wrap }: ICodeProps) {
	return <SyntaxHighlighter
		language={language ?? "typescript"}
		style={theme === "light" ? materialLight : darcula}
		wrapLongLines
		lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
		wrapLines={true}
	>
		{children.trim()}
	</SyntaxHighlighter>
}