import { combineLatest, defer, Observable } from "rxjs"
import { first, map, mergeMap, startWith } from "rxjs/operators"
import Web3 from "web3"
import type { WalletLinkOptions, WalletLink } from "walletlink/dist/WalletLink"
import { AbstractConnectionProvider, ConnectionState, STATE_CONNECTING, STATE_DISCONNECTED } from "../provider"
import { EthereumWallet } from "./domain"
import { Maybe } from "../../common/maybe"
import { cache, promiseToObservable } from "../common/utils"

export type WalletLinkConfig = {
	url: string
	networkId: number
	estimationUrl: string
}

export class WalletLinkConnectionProvider extends AbstractConnectionProvider<"walletlink", EthereumWallet> {
	private readonly walletlink: Observable<WalletLink>
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor(
		private readonly config: WalletLinkConfig,
		private readonly walletLinkOptions: WalletLinkOptions
	) {
		super()
		this.walletlink = cache(() => this._connect())
		this.connection = defer(() => this.walletlink.pipe(
			mergeMap(() => promiseToObservable(this.getWallet())),
			map(wallet => {
				if (wallet) {
					return { status: "connected" as const, connection: wallet }
				} else {
					return STATE_DISCONNECTED
				}
			}),
			startWith(STATE_CONNECTING),
		))
	}

	private async _connect(): Promise<WalletLink> {
		const { default: WalletLink } = await import("walletlink")
		return new WalletLink(this.walletLinkOptions)
	}

	getId(): string {
		return "walletlink"
	}

	getConnection() {
		return this.connection
	}

	getOption(): Promise<Maybe<"walletlink">> {
		return Promise.resolve("walletlink")
	}

	async isAutoConnected(): Promise<boolean> {
		return false
	}

	async isConnected(): Promise<boolean> {
		const wallet = await (await this.getWallet()).pipe(first()).toPromise()
		return wallet?.address !== undefined
	}

	private async getWallet(): Promise<Observable<EthereumWallet | undefined>> {
		const sdk = await this.walletlink.pipe(first()).toPromise()
		const web3Provider = sdk.makeWeb3Provider(this.config.url, this.config.networkId)
		const web3 = new Web3(web3Provider)
		await web3Provider.enable()

		const accounts = web3.eth.getAccounts();
		const chainId = web3.eth.getChainId();

		return combineLatest([accounts, chainId]).pipe(
			map(([accounts, chainId]) => {
				const address = accounts[0]
				if (address) {
					return { chainId, address, provider: web3 }
				} else {
					return undefined
				}
			}),
		)
	}
}
