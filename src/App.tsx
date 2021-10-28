/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useState } from 'react'
import './App.css'
import { Mint } from "./mint"
import { Sell } from "./order/sell"
import { Fill } from "./fill"
import { useSdk } from "./sdk/use-sdk"
import { IRaribleSdk } from "@rarible/sdk/build/domain"
import { Bid } from "./order/bid"

const allTabs = ["mint", "sell", "bid", "fill"] as const
type Tab = typeof allTabs[number]

function App() {
	const [tab, setTab] = useState<Tab>("mint")
	const { sdk, connect, wallet } = useSdk("staging")

	if (!sdk || !wallet) {
		return <div><button onClick={connect}>connect</button></div>
	}

	return (
		<div className="App">
			<div style={{paddingBottom: 10}}>Connected: {wallet.address}</div>
			{allTabs.map(t => (<TabButton key={t} tab={t} selected={tab === t} selectTab={setTab}/>))}
			<div style={{ paddingTop: 10 }}><SelectedTab tab={tab} sdk={sdk}/></div>
		</div>
	)
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
