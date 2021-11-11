/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useState } from 'react'
import './App.css'
import { Mint } from "./mint"
import { Sell } from "./order/sell"
import { Fill } from "./fill"
import { IRaribleSdk } from "@rarible/sdk/build/domain"
import { Bid } from "./order/bid"
import { ConnectorComponent } from "./connector/component"
import { ConnectorImpl, MappedConnectionProvider } from "./connector"
import { InjectedWeb3ConnectionProvider } from "./connector/injected"
import { toUnionAddress, UnionAddress } from "@rarible/types"
import { createRaribleSdk } from "@rarible/sdk"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"

const allTabs = ["mint", "sell", "bid", "fill"] as const
type Tab = typeof allTabs[number]

const injected = MappedConnectionProvider.create(
	new InjectedWeb3ConnectionProvider(),
	wallet => ({ ...wallet, type: "ETHEREUM" as const, address: toUnionAddress(`ETHEREUM:${wallet.address}`) }),
)
type Wallet = {
	type: "ETHEREUM"
	address: UnionAddress
	provider: any
	chainId: number
}

const connector: ConnectorImpl<"injected", Wallet> = ConnectorImpl
	.create(injected)

function App() {
	const [tab, setTab] = useState<Tab>("mint")

	return <ConnectorComponent connector={connector}>{wallet => (
		<div className="App">
			<div style={{ paddingBottom: 10 }}>Connected: {wallet.address}</div>
			{allTabs.map(t => (<TabButton key={t} tab={t} selected={tab === t} selectTab={setTab}/>))}
			<div style={{ paddingTop: 10 }}><SelectedTab tab={tab} sdk={createRaribleSdk(createEthereumWallet(wallet), "staging")}/></div>
		</div>
	)}</ConnectorComponent>
}

function createEthereumWallet(wallet: Wallet) {
	const from = wallet.address.substring("ETHEREUM:".length)
	return new EthereumWallet(new Web3Ethereum({ web3: new Web3(wallet.provider), from }), wallet.address)
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
