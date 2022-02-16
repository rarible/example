import React from "react"
import { useRxOrThrow } from "@rixio/react"
import { createRaribleSdk } from "@rarible/sdk"
import type { ConnectionState, IConnector } from "@rarible/connector"
import { getStateDisconnected } from "@rarible/connector"
import { IRaribleSdk } from "@rarible/sdk/build/domain"
import { BlockchainWallet } from "@rarible/sdk-wallet"

export interface IWalletAndAddress {
	wallet: BlockchainWallet
	address: string
}

export interface IConnectorContext {
	connector?: IConnector<string, IWalletAndAddress>
	state: ConnectionState<IWalletAndAddress>
	sdk?: IRaribleSdk
	walletAddress?: string
}

export const ConnectorContext = React.createContext<IConnectorContext>({
	connector: undefined,
	state: getStateDisconnected(),
	sdk: undefined,
	walletAddress: undefined,
})

export interface IConnectorComponentProps {
	connector: IConnector<string, IWalletAndAddress>
}

export function SdkConnectionProvider({ connector, children }: React.PropsWithChildren<IConnectorComponentProps>) {
	const conn = useRxOrThrow(connector.connection)

	const sdk = conn.status === "connected" ? createRaribleSdk(conn.connection.wallet, "staging") : undefined

	const context: IConnectorContext = {
		connector,
		state: conn,
		sdk,
		walletAddress: conn.status === "connected" ? conn.connection.address : undefined,
	}

	return <ConnectorContext.Provider value={context}>
		{children}
	</ConnectorContext.Provider>
}