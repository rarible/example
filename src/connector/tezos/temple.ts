import { ConnectionProvider, ConnectionState } from "../provider"
import { TempleWallet } from "@temple-wallet/dapp"
import { TempleDAppNetwork } from "@temple-wallet/dapp/src/types"
import { defer, from, Observable, timer } from "rxjs"
import { TezosToolkit, WalletProvider } from "@taquito/taquito"
import { concatMap, map, mergeMap, startWith } from "rxjs/operators"

type TezosWallet = {
	toolkit: TezosToolkit
	wallet: WalletProvider
	address: string
}

export class TempleConnectionProvider implements ConnectionProvider<"temple", TezosWallet> {

	readonly connection: Observable<ConnectionState<TezosWallet>>

	constructor(
		private readonly applicationName: string,
		private readonly network: TempleDAppNetwork,
	) {
		this._connect = this._connect.bind(this)
		this.toWallet = this.toWallet.bind(this)
		this.connection = defer(() => from(this._connect())).pipe(
			mergeMap(([wallet, toolkit]) => this.toWallet(wallet, toolkit)),
			map(wallet => ({ status: "connected" as const, connection: wallet })),
			startWith({ status: "connecting" }),
		)
	}

	private toWallet(wallet: TempleWallet, toolkit: TezosToolkit): Observable<TezosWallet> {
		return timer(0, 1000).pipe(
			concatMap(() => from(wallet.getPKH())),
			map(address => ({ address, toolkit, wallet })),
		)
	}

	private async _connect(): Promise<[TempleWallet, TezosToolkit]> {
		const wallet = new TempleWallet(this.applicationName)
		await wallet.connect(this.network)
		return [wallet, wallet.toTezos()]
	}

	option = Promise.resolve("temple" as const)

	//todo can this be auto-connected?
	isAutoConnected = Promise.resolve(false)
}
