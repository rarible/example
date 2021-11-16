import { AbstractConnectionProvider, ConnectionState } from "../provider"
import type { TempleWallet } from "@temple-wallet/dapp"
import type { TempleDAppNetwork } from "@temple-wallet/dapp/src/types"
import { defer, from, Observable, timer } from "rxjs"
import { TezosToolkit } from "@taquito/taquito"
import { concatMap, map, mergeMap, startWith } from "rxjs/operators"

type TezosWallet = {
	toolkit: TezosToolkit
	wallet: TempleWallet
	address: string
}

export class TempleConnectionProvider extends AbstractConnectionProvider<"temple", TezosWallet> {

	private readonly connection: Observable<ConnectionState<TezosWallet>>

	constructor(
		private readonly applicationName: string,
		private readonly network: TempleDAppNetwork,
	) {
		super()
		this._connect = this._connect.bind(this)
		this.toWallet = this.toWallet.bind(this)
		this.connection = defer(() => from(this._connect())).pipe(
			mergeMap(([wallet, toolkit]) => this.toWallet(wallet, toolkit)),
			map(wallet => ({ status: "connected" as const, connection: wallet })),
			startWith({ status: "connecting" }),
		)
	}

	getConnection(): Observable<ConnectionState<TezosWallet>> {
		return this.connection
	}

	private toWallet(wallet: TempleWallet, toolkit: TezosToolkit): Observable<TezosWallet> {
		return timer(0, 1000).pipe(
			concatMap(() => from(toolkit.wallet.pkh())),
			map(address => ({ address, toolkit, wallet })),
		)
	}

	private async _connect(): Promise<[TempleWallet, TezosToolkit]> {
		const { TempleWallet } = await import("@temple-wallet/dapp")
		const wallet = new TempleWallet(this.applicationName)
		await wallet.connect(this.network)
		return [wallet, wallet.toTezos()]
	}

	getOption() {
		return Promise.resolve("temple" as const)
	}

	//todo can this be auto-connected?
	isAutoConnected() {
		return Promise.resolve(false)
	}

	async isConnected(): Promise<boolean> {
		return true //todo try to find a way to check if temple is connected
	}
}
