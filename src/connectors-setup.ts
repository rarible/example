import { NetworkType as TezosNetwork } from "@airgap/beacon-sdk"
import Web3 from "web3"
import { FlowWallet, TezosWallet, EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import {
	Connector,
	IConnectorStateProvider,
	ConnectionProvider,
	InjectedWeb3ConnectionProvider,
	AbstractConnectionProvider,
	EthereumProviderConnectionResult,
} from "@rarible/connector"
import { FclConnectionProvider, FlowProviderConnectionResult } from "@rarible/connector-fcl"
import { MEWConnectionProvider } from "@rarible/connector-mew"
import { BeaconConnectionProvider, TezosProviderConnectionResult } from "@rarible/connector-beacon"
import { TorusConnectionProvider } from "@rarible/connector-torus"
import { WalletLinkConnectionProvider } from "@rarible/connector-walletlink"
import { WalletConnectConnectionProvider } from "@rarible/connector-walletconnect"
// import { FortmaticConnectionProvider } from "@rarible/connector-fortmatic"
// import { PortisConnectionProvider } from "@rarible/connector-portis"
import { IWalletAndAddress } from "./components/connector/sdk-connection-provider"


const ethereumRpcMap: Record<number, string> = {
	1: "https://node-mainnet.rarible.com",
	3: "https://node-ropsten.rarible.com",
	4: "https://node-rinkeby.rarible.com",
	17: "https://node-e2e.rarible.com",
}

function mapEthereumWallet<O>(provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>): ConnectionProvider<O, IWalletAndAddress> {
	//todo: set correct blockchain polygon/ethereum
	return provider.map(state => ({
		wallet: new EthereumWallet(new Web3Ethereum({ web3: new Web3(state.provider), from: state.address })),
		address: state.address
	}))
}

function mapFlowWallet<O>(provider: AbstractConnectionProvider<O, FlowProviderConnectionResult>): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => ({
		wallet: new FlowWallet(state.fcl),
		address: state.address,
	}))
}

function mapTezosWallet<O>(provider: AbstractConnectionProvider<O, TezosProviderConnectionResult>): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(async state => {
		const {
			beacon_provider: createBeaconProvider
		} = await import("tezos-sdk-module/dist/providers/beacon/beacon_provider")
		const provider = await createBeaconProvider(state.wallet as any, state.toolkit)

		return {
			wallet: new TezosWallet(provider),
			address: state.address,
		}
	})
}

const injected = mapEthereumWallet(new InjectedWeb3ConnectionProvider())

const mew = mapEthereumWallet(new MEWConnectionProvider({
	networkId: 4,
	rpcUrl: ethereumRpcMap[4]
}))

const beacon: ConnectionProvider<"beacon", IWalletAndAddress> = mapTezosWallet(new BeaconConnectionProvider({
	appName: "Rarible Test",
	accessNode: "https://tezos-hangzhou-node.rarible.org",
	network: TezosNetwork.HANGZHOUNET
}))

const fcl = mapFlowWallet(new FclConnectionProvider({
	accessNode: "https://access-testnet.onflow.org",
	walletDiscovery: "https://flow-wallet-testnet.blocto.app/authn",
	network: "testnet",
	applicationTitle: "Rari Test",
	applicationIcon: "https://rarible.com/favicon.png?2d8af2455958e7f0c812"
}))

const torus = mapEthereumWallet(new TorusConnectionProvider({
	network: {
		host: "rinkeby"
	}
}))

const walletLink = mapEthereumWallet(new WalletLinkConnectionProvider({
	estimationUrl: ethereumRpcMap[4],
	networkId: 4,
	url: ethereumRpcMap[4]
}, {
	appName: "Rarible",
	appLogoUrl: "https://rarible.com/static/logo-500.static.png",
	darkMode: false,
}))
const walletConnect = mapEthereumWallet(new WalletConnectConnectionProvider({
	rpc: {
		4: "https://node-rinkeby.rarible.com"
	},
	chainId: 4,
}))

// Providers required secrets
// const fortmatic = mapEthereumWallet(new FortmaticConnectionProvider({ apiKey: "ENTER", ethNetwork: { chainId: 4, rpcUrl: "https://node-rinkeby.rarible.com" } }))
// const portis = mapEthereumWallet(new PortisConnectionProvider({ appId: "ENTER", network: "rinkeby" }))

const state: IConnectorStateProvider = {
	async getValue(): Promise<string | undefined> {
		const value = localStorage.getItem("saved_provider")
		return value ? value : undefined
	},
	async setValue(value: string | undefined): Promise<void> {
		localStorage.setItem("saved_provider", value || "")
	},
}

export const connector = Connector
	.create(injected, state)
	.add(torus)
	.add(walletLink)
	.add(mew)
	.add(beacon)
	.add(fcl)
	.add(walletConnect)
	// .add(portis)
	// .add(fortmatic)
