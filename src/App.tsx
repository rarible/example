/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useState } from 'react'
import './App.css'
import { Mint } from "./mint"
import { Sell } from "./sell"
import { mockSdk } from "./mock-sdk"
import { Fill } from "./fill"

const allTabs = ["mint", "sell", "bid", "fill"] as const
type Tab = typeof allTabs[number]

function App() {
	const [tab, setTab] = useState<Tab>("mint")

	return (
		<div className="App">
			{allTabs.map(t => (<TabButton key={t} tab={t} selected={tab === t} selectTab={setTab}/>))}
			<div style={{ paddingTop: 10 }}><SelectedTab tab={tab}/></div>
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

function SelectedTab({ tab }: { tab: Tab }) {
	switch (tab) {
		case "bid":
			return <Mint sdk={mockSdk}/>
		case "fill":
			return <Fill sdk={mockSdk}/>
		case "mint":
			return <Mint sdk={mockSdk}/>
		case "sell":
			return <Sell sdk={mockSdk}/>
	}
}

export default App
