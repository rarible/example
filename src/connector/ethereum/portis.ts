import { combineLatest, defer, from, Observable } from "rxjs"
import { first, map, mergeMap, startWith } from "rxjs/operators"
import type { INetwork, default as Portis } from "@portis/web3"
import Web3 from "web3"
import { AbstractConnectionProvider, ConnectionState } from "../provider"
import { EthereumWallet } from "./domain"
import { Maybe } from "../../common/maybe"
import { cache, promiseToObservable } from "../common/utils"

type PortisInstance = Portis
type PortisNetwork = string | INetwork

export class PortisConnectionProvider extends AbstractConnectionProvider<"portis", EthereumWallet> {
	private readonly portis: Observable<PortisInstance>
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor(
		private readonly apiKey: string,
		private readonly network: PortisNetwork,
	) {
		super()
		this.portis = cache(() => this._connect())
		this.connection = defer(() => this.portis.pipe(
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

	private async _connect(): Promise<PortisInstance> {
		const { default: Portis } = await import("@portis/web3")
		return new Portis(this.apiKey, this.network)
	}

	getId(): string {
		return "portis"
	}

	getConnection() {
		return this.connection
	}

	getOption(): Promise<Maybe<"portis">> {
		return Promise.resolve("portis")
	}

	async isAutoConnected(): Promise<boolean> {
		return false
	}

	async isConnected(): Promise<boolean> {
		const sdk = await this.portis.pipe(first()).toPromise()
		return true === (await sdk.isLoggedIn()).result
	}

	private async getWallet(): Promise<Observable<EthereumWallet | undefined>> {
		const sdk = await this.portis.pipe(first()).toPromise()
		const web3 = new Web3(sdk.provider)

		const accounts = web3.eth.getAccounts();
		const chainId = web3.eth.getChainId();

		return combineLatest([accounts, chainId]).pipe(
			map(([accounts, chainId]) => {
				const address = accounts[0]
				if (address) {
					return { chainId, address, provider: sdk.provider }
				} else {
					return undefined
				}
			}),
		)
	}
}