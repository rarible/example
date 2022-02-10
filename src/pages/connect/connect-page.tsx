import React, { useContext } from "react"
import { Alert, AlertTitle, Link, Typography } from "@mui/material"
import { faLink, faLinkSlash } from "@fortawesome/free-solid-svg-icons"
import { Page } from "../../components/page"
import { ConnectOptions } from "./connect-options"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { Address } from "../../components/common/address"
import { Icon } from "../../components/common/icon"
import { CommentedBlock } from "../../components/common/commented-block"
import { Code } from "../../components/common/code"
import { ConnectorUsageComment } from "./comments/connector-usage-comment"

function ConnectionStatus() {
	const connection = useContext(ConnectorContext)

	switch (connection?.state.status) {
		case "connected":
			return <Alert severity="success" icon={<Icon icon={faLink}/>}>
				<AlertTitle>Current Status: connected</AlertTitle>
				Application is connected to wallet <Address
				address={connection.state.connection.address}
				trim={false}
			/>
			</Alert>
		case "disconnected":
			return <Alert severity="error" icon={<Icon icon={faLinkSlash}/>}>
				<AlertTitle>Disconnected</AlertTitle>
				Application currently not connected to any wallet
			</Alert>
		case "connecting":
			return <Alert severity="info">
				<AlertTitle>Connecting...</AlertTitle>
				Connection to wallet in process
			</Alert>
		case "initializing":
			return <Alert severity="info">
				<AlertTitle>Initializing...</AlertTitle>
				Connector initialization
			</Alert>
		default:
			return null
	}
}

export function ConnectPage() {
	return (
		<Page header={"Wallet Connect"}>
			<CommentedBlock sx={{ my: 2 }}>
				<ConnectionStatus/>
			</CommentedBlock>

			<CommentedBlock sx={{ my: 2 }} comment={<ConnectorUsageComment/>}>
				<Typography variant="h6" component="h2" gutterBottom>Connect to: </Typography>
				<ConnectOptions/>
			</CommentedBlock>
		</Page>
	)
}
