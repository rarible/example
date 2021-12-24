import { defer, Observable } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import type { default as Portis, INetwork } from "@portis/web3"
import Web3 from "web3"
import { AbstractConnectionProvider } from "../provider"
import { EthereumWallet } from "./domain"
import { Maybe } from "../../common/maybe"
import { cache, noop } from "../common/utils"
import { connectToWeb3 } from "./common/web3connection"
import { ConnectionState, STATE_DISCONNECTED, getStateConnecting } from "../connection-state"

type PortisInstance = Portis
type PortisNetwork = string | INetwork

const PROVIDER_ID = "portis" as const

export class PortisConnectionProvider extends AbstractConnectionProvider<typeof PROVIDER_ID, EthereumWallet> {
	private readonly instance: Observable<PortisInstance>
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor(
		private readonly apiKey: string,
		private readonly network: PortisNetwork,
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = defer(() => this.instance.pipe(
			mergeMap(instance => {
				const web3 = new Web3(instance.provider)
				return connectToWeb3(web3, instance, {
					disconnect: () => instance.logout().then(noop).catch(noop)
				})
			}),
			startWith(getStateConnecting(PROVIDER_ID)),
		))
	}

	private async _connect(): Promise<PortisInstance> {
		const { default: Portis } = await import("@portis/web3")
		return new Portis(this.apiKey, this.network)
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
		const sdk = await this.instance.pipe(first()).toPromise()
		return true === (await sdk.isLoggedIn()).result
	}
}
