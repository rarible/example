import React from "react"
import { Box, IconButton, Stack, Typography } from "@mui/material"
import { StateConnected } from "@rarible/connector/build/connection-state"
import { faLinkSlash } from "@fortawesome/free-solid-svg-icons"
import { IWalletAndAddress } from "../../../connector/sdk-connection-provider"
import { Address } from "../../../common/address"
import { Icon } from "../../../common/icon"

export interface IConnectedStatusProps {
	state: StateConnected<IWalletAndAddress>
}

export function ConnectedStatus({ state }: IConnectedStatusProps) {
	return (
		<Stack direction="row" alignItems="center" spacing={2}>
			<Box sx={{ display: "inline" }}>
				<Typography variant="subtitle1">Connected</Typography>
				<Typography variant="subtitle2">
					<Address address={state.connection.address}/>
				</Typography>
			</Box>
			<IconButton
				color="inherit"
				title="Disconnect"
				onClick={() => state.disconnect && state.disconnect()}
			>
				<Icon icon={faLinkSlash}/>
			</IconButton>
		</Stack>
	)
}