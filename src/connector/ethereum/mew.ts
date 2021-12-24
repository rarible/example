import { defer, Observable, of } from "rxjs"
import { catchError, first, mergeMap, startWith } from "rxjs/operators"
import Web3 from "web3"
import { AbstractConnectionProvider } from "../provider"
import { EthereumWallet } from "./domain"
import { Maybe } from "../../common/maybe"
import { cache } from "../common/utils"
import { connectToWeb3 } from "./common/web3connection"
import { ConnectionState, STATE_DISCONNECTED, getStateConnecting } from "../connection-state"

export type MEWConfig = {
	rpcUrl: string
	networkId: number
}

type MewInstance = any

const PROVIDER_ID = "mew" as const

export class MEWConnectionProvider extends AbstractConnectionProvider<typeof PROVIDER_ID, EthereumWallet> {
	private readonly instance: Observable<MewInstance>
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor(
		private readonly config: MEWConfig
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = defer(() => this.instance.pipe(
			mergeMap(instance => {
				const web3 = new Web3(instance.makeWeb3Provider())
				return connectToWeb3(web3, instance, {
					disconnect: () => instance.disconnect()
				})
			}),
			catchError(err => of(STATE_DISCONNECTED)),
			startWith(getStateConnecting(PROVIDER_ID)),
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
		return PROVIDER_ID
	}

	getConnection() {
		return this.connection
	}

	getOption(): Promise<Maybe<typeof PROVIDER_ID>> {
		return Promise.resolve(PROVIDER_ID)
	}

	async isAutoConnected(): Promise<boolean> {
		return false
	}

	async isConnected(): Promise<boolean> {
		const instance = await this.instance.pipe(first()).toPromise()
		return instance.Provider.isConnected
	}
}