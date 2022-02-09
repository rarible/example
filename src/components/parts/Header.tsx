import React from "react"
import { AppBar, Box, Button, IconButton, Stack, Toolbar, Typography } from "@mui/material"
import { Logout } from "@mui/icons-material"
import { Link } from "react-router-dom"

function ConnectionState() {
	const connected = false


	return (
		<Stack direction="row" alignItems="center" spacing={2}>
			{
				connected &&
				<Box sx={{ display: "inline" }}>
					<Typography variant="subtitle1">Connected</Typography>
					<Typography variant="subtitle2">0x0d28e9Bd34...a60F92</Typography>
				</Box>
			}
			{
				connected ?
				<IconButton color="inherit" title="Disconnect">
					<Logout/>
				</IconButton>
				: <Button color="inherit" component={Link} to="/connect">Connect</Button>
			}
		</Stack>
	)
}

export function Header() {
	return (
		<AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
			<Toolbar>
				<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
					Rarible SDK Example
				</Typography>
				<ConnectionState/>
			</Toolbar>
		</AppBar>
	)
}
