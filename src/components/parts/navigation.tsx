import React from "react"
import { List } from "@mui/material"
import { ListItemLink } from "../common/list-item-link"


export function Navigation() {
	const links = [{
		label: "About",
		path: "/about"
	}, {
		label: "Connect",
		path: "/connect"
	}, {
		label: "Deploy Collection",
		path: "/deploy"
	}, {
		label: "Sell",
		path: "/sell"
	}, {
		label: "Buy",
		path: "/buy"
	}]

	return (
		<List>
			{links.map((link, index) => (
				<ListItemLink key={link.path} to={link.path} primary={link.label}/>
			))}
		</List>
	)
}
