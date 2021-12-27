import { defer, Observable } from "rxjs"
import type { WidgetMode } from "fortmatic/dist/cjs/src/core/sdk"
import { first, mergeMap, startWith } from "rxjs/operators"
import { AbstractConnectionProvider } from "../provider"
import { EthereumWallet } from "./domain"
import Web3 from "web3"
import { Maybe } from "../../common/maybe"
import { cache, noop } from "../common/utils"
import { connectToWeb3 } from "./common/web3connection"
import { ConnectionState, getStateConnecting } from "../connection-state"

type FM = WidgetMode

const PROVIDER_ID = "fortmatic" as const

export class FortmaticConnectionProvider extends AbstractConnectionProvider<typeof PROVIDER_ID, EthereumWallet> {
	private readonly instance: Observable<FM>
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor(
		private readonly apiKey: string,
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = defer(() => this.instance.pipe(
			mergeMap(instance => {
				const web3 = new Web3(instance.getProvider() as any)
				return connectToWeb3(web3, instance, {
					disconnect: () => instance.user.logout().then(noop).catch(noop)
				})
			}),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		))
	}

	private async _connect(): Promise<FM> {
		const { default: Fortmatic } = await import("fortmatic")
		return new Fortmatic(this.apiKey) //todo all options?
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
		return await sdk.user.isLoggedIn()
	}
}
