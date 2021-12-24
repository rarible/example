import { AbstractConnectionProvider } from "../provider"
import type { TempleWallet } from "@temple-wallet/dapp"
import type { TempleDAppNetwork } from "@temple-wallet/dapp/src/types"
import { defer, from, Observable, timer } from "rxjs"
import { TezosToolkit } from "@taquito/taquito"
import { concatMap, first, map, mergeMap, startWith } from "rxjs/operators"
import { Maybe } from "../../common/maybe"
import { TezosWallet } from "./domain"
import { cache } from "../common/utils"
import { ConnectionState, getStateConnecting } from "../connection-state"
import { templeProvider } from "./temple-provider"

const PROVIDER_ID = "temple" as const

export class TempleConnectionProvider extends AbstractConnectionProvider<typeof PROVIDER_ID, TezosWallet> {
	private readonly instance: Observable<{ templeWallet: TempleWallet, tezosToolkit: TezosToolkit }>
	private readonly connection: Observable<ConnectionState<TezosWallet>>

	constructor(
		private readonly applicationName: string,
		private readonly network: TempleDAppNetwork,
	) {
		super()
		this.instance = cache(() => this._connect())
		this.toWallet = this.toWallet.bind(this)
		this.connection = defer(() => this.instance.pipe(
			mergeMap(({templeWallet, tezosToolkit}) => this.toWallet(templeWallet, tezosToolkit)),
			map(wallet => ({ status: "connected" as const, connection: wallet })),
			startWith(getStateConnecting(PROVIDER_ID)),
		))
	}

	getId(): string {
		return PROVIDER_ID
	}

	getConnection(): Observable<ConnectionState<TezosWallet>> {
		return this.connection
	}

	private toWallet(wallet: TempleWallet, toolkit: TezosToolkit): Observable<TezosWallet> {
		return timer(0, 1000).pipe(
			concatMap(() => from(toolkit.wallet.pkh())),
			map(address => ({ address, toolkit, wallet, provider: templeProvider(wallet, toolkit) })),
		)
	}

	private async _connect(): Promise<{ templeWallet: TempleWallet, tezosToolkit: TezosToolkit }> {
		const { TempleWallet } = await import("@temple-wallet/dapp")
		const wallet = new TempleWallet(this.applicationName)
		await wallet.connect(this.network)
		return { templeWallet: wallet, tezosToolkit: wallet.toTezos() }
	}

	getOption(): Promise<Maybe<typeof PROVIDER_ID>> {
		return Promise.resolve(PROVIDER_ID)
	}

	//todo can this be auto-connected?
	isAutoConnected() {
		return Promise.resolve(false)
	}

	async isConnected(): Promise<boolean> {
		const sdk = await this.instance.pipe(first()).toPromise()
		return sdk.templeWallet.connected
	}
}
