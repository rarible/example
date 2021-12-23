import { defer, Observable } from "rxjs"
import type { WidgetMode } from "fortmatic/dist/cjs/src/core/sdk"
import { first, mergeMap, startWith } from "rxjs/operators"
import { AbstractConnectionProvider, ConnectionState, STATE_CONNECTING, STATE_DISCONNECTED } from "../provider"
import { EthereumWallet } from "./domain"
import Web3 from "web3"
import { Maybe } from "../../common/maybe"
import { cache } from "../common/utils"

type FM = WidgetMode

export class FortmaticConnectionProvider extends AbstractConnectionProvider<"fortmatic", EthereumWallet> {
	private readonly fortmatic: Observable<FM>
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor(
		private readonly apiKey: string,
	) {
		super()
		this.fortmatic = cache(() => this._connect())
		this.connection = defer(() => this.fortmatic.pipe(
			mergeMap(sdk => getConnection(sdk)),
			startWith(STATE_CONNECTING),
		))
	}

	private async _connect(): Promise<FM> {
		const { default: Fortmatic } = await import("fortmatic")
		return new Fortmatic(this.apiKey) //todo all options?
	}

	getId(): string {
		return "fortmatic"
	}

	getConnection() {
		return this.connection
	}

	getOption(): Promise<Maybe<"fortmatic">> {
		return Promise.resolve("fortmatic")
	}

	async isAutoConnected(): Promise<boolean> {
		return false
	}

	async isConnected(): Promise<boolean> {
		const sdk = await this.fortmatic.pipe(first()).toPromise()
		return await sdk.user.isLoggedIn()
	}
}

async function getConnection(sdk: WidgetMode): Promise<ConnectionState<EthereumWallet>> {
	const provider = sdk.getProvider()
	const web3 = new Web3(provider as any)

	const accounts = await web3.eth.getAccounts();
	const chainId = await web3.eth.getChainId();

	const address = accounts[0]
	if (address) {
		const wallet: EthereumWallet = { chainId, address, provider }
		const disconnect = () => sdk.user.logout()
		return { status: "connected" as const, connection: wallet, disconnect }
	} else {
		return STATE_DISCONNECTED
	}
}

