import { combineLatest, defer, Observable } from "rxjs"
import { first, map, mergeMap, startWith } from "rxjs/operators"
import type { default as Torus } from "@toruslabs/torus-embed"
import Web3 from "web3"
import type { TorusParams } from "@toruslabs/torus-embed/dist/types/interfaces"
import { AbstractConnectionProvider, ConnectionState } from "../provider"
import { EthereumWallet } from "./domain"
import { Maybe } from "../../common/maybe"
import { cache, promiseToObservable } from "../common/utils"

export type TorusConfig = TorusParams

export class TorusConnectionProvider extends AbstractConnectionProvider<"torus", EthereumWallet> {
	private readonly torus: Observable<Torus>
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor(
		private readonly config: TorusConfig
	) {
		super()
		this.torus = cache(() => this._connect())
		this.connection = defer(() => this.torus.pipe(
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

	private async _connect(): Promise<Torus> {
		const { default: Torus } = await import("@toruslabs/torus-embed")
		const torus = new Torus()
		await torus.init(this.config)
		await torus.login()
		return torus
	}

	getId(): string {
		return "torus"
	}

	getConnection() {
		return this.connection
	}

	getOption(): Promise<Maybe<"torus">> {
		return Promise.resolve("torus")
	}

	async isAutoConnected(): Promise<boolean> {
		return false
	}

	async isConnected(): Promise<boolean> {
		const sdk = await this.torus.pipe(first()).toPromise()
		return sdk.isInitialized && sdk.isLoggedIn
	}

	private async getWallet(): Promise<Observable<EthereumWallet | undefined>> {
		const sdk = await this.torus.pipe(first()).toPromise()
		const web3 = new Web3(sdk.provider as any)

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