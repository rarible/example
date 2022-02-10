import React, { useContext, useMemo } from "react"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { from } from "rxjs"
import { Rx } from "@rixio/react"
import { LoadingButton } from "@mui/lab"
import { Box, Stack } from "@mui/material"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { Icon } from "../../components/common/icon"

function getWalletInfo(option: string): {label: string} {
	switch (option) {
		case "walletlink":
			return {label: "Coinbase"}
		case "fcl":
			return {label: "Blocto"}
		default:
			return {label: option}
	}
}

export function ConnectOptions() {
	const connection = useContext(ConnectorContext)
	const { connector, state } = connection

	const options$ = useMemo(() => connector ? from(connector.getOptions()) : from([]), [connector])

	if (!connector) {
		return null
	}

	return <Box sx={{
		maxWidth: 300
	}}>
		<Rx value$={options$}>
			{options => (
				<Stack spacing={1}>
					{
						options.map(o => {
							const walletInfo = getWalletInfo(o.option)
							return <div key={o.option}>
								<LoadingButton
									onClick={() => connector.connect(o)}
									loading={state.status === "connecting" && state.providerId === o.provider.getId()}
									loadingPosition="start"
									startIcon={<Icon icon={faChevronRight}/>}
									sx={{
										justifyContent: "start",
										pl: "3rem",
										"& .MuiButton-startIcon": {
											position: "absolute",
											left: "1.25rem"
										}
									}}
									variant="outlined"
									disabled={state?.status === "connected"}
									fullWidth
								>
									{walletInfo.label}
								</LoadingButton>
							</div>
						})
					}
				</Stack>
			)}
		</Rx>
	</Box>
}
