import React from "react"
import { Page } from "../../../components/page"
import { CommentedBlock } from "../../../components/common/commented-block"
import { Link, Typography } from "@mui/material"
import { Code } from "../../../components/common/code"
import { ConnectOptions } from "../connect-options"
import { InlineCode } from "../../../components/common/inline-code"

export function ConnectorUsageComment() {
	return <>
		<Typography gutterBottom>
			To simplify the connection to various wallets, we moved this logic to a separate package <InlineCode>@rarible/connector</InlineCode>.
		</Typography>
		<Typography gutterBottom>
			Check out <Link
				href="https://github.com/rarible/sdk/tree/master/packages/connector"
				target="_blank"
			>documentation</Link> in its repository.
		</Typography>
		<Code>
			{`
import {
  Connector,
  IConnectorStateProvider,
  ConnectionProvider,
  InjectedWeb3ConnectionProvider,
  AbstractConnectionProvider,
  EthereumProviderConnectionResult,
} from "@rarible/connector"
			
const connector = Connector
  .create(injected, state)
  .add(torus)
  .add(walletLink)
  .add(mew)
  .add(beacon)
  .add(fcl)
  .add(walletConnect)
					`}
		</Code>
	</>
}
