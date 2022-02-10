import React from "react"

export function InlineCode(props: React.PropsWithChildren<{}>) {
	return <code style={{
		display: "inline-block",
		background: "#eee",
		borderRadius: 3,
		padding: "0 4px",
		color: "#df3d3d",
	}}>{props.children}</code>
}