import React from "react"
import {
	Box,
	Drawer,
	Toolbar
} from "@mui/material"
import { Route, Routes } from "react-router-dom"
import { AboutPage } from "./pages/about/about-page"
import { ConnectPage } from "./pages/connect/connect-page"
import { NotFoundPage } from "./pages/404/404-page"
import { Header } from "./components/parts/Header"
import { Navigation } from "./components/parts/Navigation"


const drawerWidth = 300

export function App() {
	return (
		<Box sx={{ display: 'flex' }}>
			<Header/>
			<Drawer
				variant="permanent"
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
				}}
			>
				<Toolbar/>
				<Box sx={{ overflow: 'auto' }}>
					<Navigation/>
				</Box>
			</Drawer>
			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<Toolbar/>
				<Routes>
					<Route path="/" element={<AboutPage/>}/>
					<Route path="about" element={<AboutPage/>}/>
					<Route path="connect" element={<ConnectPage/>}/>
					<Route path="*" element={<NotFoundPage/>}/>
				</Routes>
			</Box>
		</Box>
	);
}
