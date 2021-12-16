/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useCallback, useEffect, useState} from 'react'
import './App.css'
import {Mint} from "./mint"
import {Sell} from "./order/sell"
import {useSdk} from "./sdk/use-sdk"
import {IRaribleSdk} from "@rarible/sdk/build/domain"
import {Bid} from "./order/bid"
import {Collection} from "./collection";
import {Maybe} from "./common/maybe";
import {Blockchain} from "@rarible/api-client";
import {AcceptBid} from "./acceptBid";
import {Buy} from "./buy";

const allTabs = ["collection", "mint", "sell", "buy", "bid", "accept bid"] as const
type Tab = typeof allTabs[number]

function App() {
	const [tab, setTab] = useState<Tab>("collection")
	const [address, setAddress] = useState<Maybe<string>>(undefined)
	const { sdk, connect, wallet } = useSdk("staging")

	useEffect(() => {
		switch (wallet?.blockchain) {
			case Blockchain.ETHEREUM:
				wallet?.ethereum.getFrom()
					.then((address) => setAddress(address))
					.catch(() => setAddress(undefined))
				break
			default:
				setAddress(undefined)
		}
	}, [wallet])

	if (!sdk || !wallet) {
		return <div>
			<button onClick={connect}>connect</button>
		</div>
	}

	return (
		<div className="App">
			<div style={{paddingBottom: 10}}>
				Connected: {address ?? "not connected"}
			</div>
			{allTabs.map(t => (<TabButton key={t} tab={t} selected={tab === t} selectTab={setTab}/>))}
			<div style={{ paddingTop: 10 }}>
				<SelectedTab tab={tab} sdk={sdk}/>
			</div>
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
		case "collection":
			return <Collection sdk={sdk}/>
		case "mint":
			return <Mint sdk={sdk}/>
		case "sell":
			return <Sell sdk={sdk}/>
		case "bid":
			return <Bid sdk={sdk}/>
		case "buy":
			return <Buy sdk={sdk}/>
		case "accept bid":
			return <AcceptBid sdk={sdk}/>
	}
}

export default App
