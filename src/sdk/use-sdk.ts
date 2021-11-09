import { BlockchainWallet, EthereumWallet } from "@rarible/sdk-wallet"
import { Maybe } from "../common/maybe"
import { useCallback, useMemo } from "react"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { createRaribleSdk } from "@rarible/sdk"
import { IRaribleSdk } from "@rarible/sdk/build/domain"
import { ConnectorImpl, MappedConnectionProvider } from "../connector"
import { InjectedWeb3ConnectionProvider } from "../connector/injected"
import { useConnector } from "../connector/use-connector"
import { toUnionAddress } from "@rarible/types"

type UseSdkResult = {
	wallet: Maybe<BlockchainWallet>
	sdk: Maybe<IRaribleSdk>
	connect: () => void
}

const injected = MappedConnectionProvider.create(
	new InjectedWeb3ConnectionProvider(),
	wallet => ({ ...wallet, type: "ETHEREUM", address: toUnionAddress(`ETHEREUM:${wallet.address}`) }),
)
const connector = ConnectorImpl
	.create(injected)

export function useSdk(env: string): UseSdkResult {
	const { connection, connect } = useConnector(connector)
	const wallet = useMemo(() => {
		if (connection !== undefined && connection.status === "connected") {
			const wallet = connection.connection
			const from = wallet.address.substring("ETHEREUM:".length)
			return new EthereumWallet(new Web3Ethereum({ web3: new Web3(wallet.provider), from }), wallet.address)
		} else {
			return undefined
		}
	}, [connection])
	const sdk = useMemo(() => {
		if (wallet !== undefined) {
			return createRaribleSdk(wallet, env as any)
		} else {
			return undefined
		}
	}, [env, wallet])
	const connectInjected = useCallback(() => connect({ provider: injected, option: "injected" }), [connect])
	return { sdk, connect: connectInjected, wallet }
}
