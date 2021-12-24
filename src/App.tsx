/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useState } from 'react'
import { IRaribleSdk } from "@rarible/sdk/build/domain"
import { ConnectorComponent } from "./connector/component"
import { ConnectionProvider, ConnectorImpl, ConnectorState } from "./connector"
import { InjectedWeb3ConnectionProvider } from "./connector/ethereum/injected"
import { toUnionAddress, UnionAddress } from "@rarible/types"
import { createRaribleSdk } from "@rarible/sdk"
import { EthereumWallet, TezosWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { NetworkType as TezosNetwork } from "@airgap/beacon-sdk"
import { TezosToolkit } from "@taquito/taquito"
import type { WalletProvider as TezosWalletProvider } from "@taquito/taquito/dist/types/wallet/interface"
import { FortmaticConnectionProvider } from "./connector/ethereum/fortmatic"
import { PortisConnectionProvider } from "./connector/ethereum/portis";
import { TorusConnectionProvider } from "./connector/ethereum/torus";
import { WalletLinkConnectionProvider } from "./connector/ethereum/walletllink"
import { MEWConnectionProvider } from "./connector/ethereum/mew"
import { IframeConnectionProvider } from "./connector/ethereum/iframe"
import { WalletConnectConnectionProvider } from "./connector/ethereum/walletconnect"
import { BeaconConnectionProvider } from "./connector/tezos/beacon"
import './App.css'
import { Bid } from "./order/bid"
import { Mint } from "./mint"
import { Sell } from "./order/sell"
import { Fill } from "./fill"
import config from "./config.json"
import { TezosProvider } from "tezos-sdk-module/dist/common/base"


const allTabs = ["mint", "sell", "bid", "fill"] as const
type Tab = typeof allTabs[number]

const ethereumRpcMap: Record<number, string> = {
	1: "https://node-mainnet.rarible.com",
	3: "https://node-ropsten.rarible.com",
	4: "https://node-rinkeby.rarible.com",
	17: "https://node-e2e.rarible.com",
}

const injected: ConnectionProvider<"injected", Wallet> = new InjectedWeb3ConnectionProvider()
	.map(wallet => ({ ...wallet, type: "ETHEREUM" as const, address: toUnionAddress(`ETHEREUM:${wallet.address}`) }))

const fortmatic: ConnectionProvider<"fortmatic", Wallet> = new FortmaticConnectionProvider(config.formatic.apiKey)
	.map(wallet => ({ ...wallet, type: "ETHEREUM" as const, address: toUnionAddress(`ETHEREUM:${wallet.address}`) }))

const portis: ConnectionProvider<"portis", Wallet> = new PortisConnectionProvider(config.portis.apiKey, "rinkeby")
	.map(wallet => ({ ...wallet, type: "ETHEREUM" as const, address: toUnionAddress(`ETHEREUM:${wallet.address}`) }))

const torus: ConnectionProvider<"torus", Wallet> = new TorusConnectionProvider({
	network: {
		host: "rinkeby"
	}
}).map(wallet => ({ ...wallet, type: "ETHEREUM" as const, address: toUnionAddress(`ETHEREUM:${wallet.address}`) }))

const walletlink: ConnectionProvider<"walletlink", Wallet> = new WalletLinkConnectionProvider({
	estimationUrl: "https://node-rinkeby.rarible.com",
	networkId: 4,
	url: "https://node-rinkeby.rarible.com"
}, {
	appName: "Rarible",
	appLogoUrl: "https://rarible.com/static/logo-500.static.png",
	darkMode: false,
}).map(wallet => ({ ...wallet, type: "ETHEREUM" as const, address: toUnionAddress(`ETHEREUM:${wallet.address}`) }))

const mew: ConnectionProvider<"mew", Wallet> = new MEWConnectionProvider({
	networkId: 4,
	rpcUrl: "https://node-rinkeby.rarible.com"
}).map(wallet => ({ ...wallet, type: "ETHEREUM" as const, address: toUnionAddress(`ETHEREUM:${wallet.address}`) }))

const iframe: ConnectionProvider<"iframe", Wallet> = new IframeConnectionProvider()
	.map(wallet => ({ ...wallet, type: "ETHEREUM" as const, address: toUnionAddress(`ETHEREUM:${wallet.address}`) }))

const walletConnect: ConnectionProvider<"walletconnect", Wallet> = new WalletConnectConnectionProvider({
	infuraId: config.walletConnect.infuraId,
	rpcMap: ethereumRpcMap,
	networkId: 4
}).map(wallet => ({ ...wallet, type: "ETHEREUM" as const, address: toUnionAddress(`ETHEREUM:${wallet.address}`) }))

const beacon: ConnectionProvider<"beacon", Wallet> = new BeaconConnectionProvider({
	appName: "Rarible Test",
	accessNode: "https://tezos-hangzhou-node.rarible.org",
	network: TezosNetwork.HANGZHOUNET
}).map(wallet => ({ ...wallet, type: "TEZOS" as const, address: toUnionAddress(`TEZOS:${wallet.address}`) }))

type Wallet = {
	type: "ETHEREUM"
	address: UnionAddress
	provider: any
	chainId: number
} | {
	type: "TEZOS"
	address: UnionAddress
	wallet: TezosWalletProvider
	toolkit: TezosToolkit
	provider: TezosProvider
}

const state: ConnectorState = {
	async getValue(): Promise<string | undefined> {
		const value = localStorage.getItem("saved_provider")
		return value ? value : undefined
	},
	async setValue(value: string | undefined): Promise<void> {
		localStorage.setItem("saved_provider", value || "")
	},
}

const connector = ConnectorImpl
	.create(injected, state)
	.add(fortmatic)
	.add(portis)
	.add(torus)
	.add(walletlink)
	.add(mew)
	.add(iframe)
	.add(walletConnect)
	.add(beacon)


function createBlockchainWallet(wallet: Wallet) {
	switch (wallet.type) {
		case "TEZOS": {
			return new TezosWallet(wallet.provider)
		}
		case "ETHEREUM": {
			const from = wallet.address.substring("ETHEREUM:".length)
			return new EthereumWallet(new Web3Ethereum({ web3: new Web3(wallet.provider), from }))
		}
		default:
			throw new Error(`Unknown type: ${typeof wallet}`)
	}
}

function App() {
	const [tab, setTab] = useState<Tab>("mint")

	return <ConnectorComponent connector={connector}>{wallet => (
		<div className="App">
			<div style={{ paddingBottom: 10 }}>Connected: {wallet.address}</div>
			{allTabs.map(t => (<TabButton key={t} tab={t} selected={tab === t} selectTab={setTab}/>))}
			<div style={{ paddingTop: 10 }}>
				<SelectedTab
					tab={tab}
					sdk={createRaribleSdk(createBlockchainWallet(wallet), "staging")}
				/>
			</div>
		</div>
	)}</ConnectorComponent>
}

function TabButton(
	{ tab, selected, selectTab }: { tab: Tab, selected: boolean, selectTab: React.Dispatch<React.SetStateAction<Tab>> },
) {
	const onClick = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		selectTab(tab)
	}, [selectTab, tab])
	return <button onClick={onClick} style={{ width: 100 }} disabled={selected}>{tab}</button>
}

function SelectedTab({ tab, sdk }: { tab: Tab, sdk: IRaribleSdk }) {
	switch (tab) {
		case "mint":
			return <Mint sdk={sdk}/>
		case "sell":
			return <Sell sdk={sdk}/>
		case "bid":
			return <Bid sdk={sdk}/>
		case "fill":
			return <Fill sdk={sdk}/>
	}
}

export default App
