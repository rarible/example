import { combineLatest, defer, Observable } from "rxjs"
import { first, map, mergeMap, startWith } from "rxjs/operators"
import Web3 from "web3"
import { AbstractConnectionProvider, ConnectionState } from "../provider"
import { EthereumWallet } from "./domain"
import { Maybe } from "../../common/maybe"
import { cache, isListenable, promiseToObservable } from "../common/utils"

export type MEWConfig = {
	rpcUrl: string
	networkId: number
}

type MewInstance = any

export class MEWConnectionProvider extends AbstractConnectionProvider<"mew", EthereumWallet> {
	private readonly mew: Observable<MewInstance>
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor(
		private readonly config: MEWConfig
	) {
		super()
		this.mew = cache(() => this._connect())
		this.connection = defer(() => this.mew.pipe(
			mergeMap(() => promiseToObservable(this.getWallet())),
			map(wallet => {
				if (wallet) {
					return { status: "connected" as const, connection: wallet }
				} else {
					return undefined
				}
			}),
			startWith({ status: "connecting" as const }),
		))
	}

	private async _connect(): Promise<MewInstance> {
		const { default: MEWconnect } = await import("@myetherwallet/mewconnect-web-client")
		const provider = new MEWconnect.Provider({
			chainId: this.config.networkId,
			rpcUrl: this.config.rpcUrl,
			noUrlCheck: true,
			windowClosedError: true,
		})
		return provider
	}

	getId(): string {
		return "mew"
	}

	getConnection() {
		return this.connection
	}

	getOption(): Promise<Maybe<"mew">> {
		return Promise.resolve("mew")
	}

	async isAutoConnected(): Promise<boolean> {
		return false
	}

	async isConnected(): Promise<boolean> {
		const wallet = await (await this.getWallet()).pipe(first()).toPromise()
		return wallet?.address !== undefined
	}

	private async getWallet(): Promise<Observable<EthereumWallet | undefined>> {
		const sdk = await this.mew.pipe(first()).toPromise()
		const web3 = new Web3(sdk.makeWeb3Provider())

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