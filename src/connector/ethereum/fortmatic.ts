export const TEST="go"
/*
import { AbstractConnectionProvider, ConnectionState } from "../provider"
import { EthereumWallet } from "./domain"
import { Maybe } from "../../common/maybe"
import { Observable } from "rxjs"
import type { WidgetMode } from "fortmatic/dist/cjs/src/core/sdk"
import { first, map } from "rxjs/operators"

type FM = WidgetMode

export class FortmaticConnectionProvider extends AbstractConnectionProvider<"fortmatic", EthereumWallet> {
	private readonly fortmatic: Observable<FM>
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor(
		private readonly apiKey: string,
	) {
		super()
		this.fortmatic = cache(() => this._connect())
		this.connection = this.fortmatic.pipe(
			map()
		)
	}

	private async _connect(): Promise<FM> {
		const { default: Fortmatic } = await import("fortmatic")
		return new Fortmatic(this.apiKey) //todo all options?
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
		return true === await sdk.user.isLoggedIn()
	}
}

function cache<T>(fn: () => Promise<T>): Observable<T> {
	let promise: Promise<T> | undefined = undefined
	return new Observable<T>(subscriber => {
		if (promise === undefined) {
			promise = fn()
		}
		promise
			.then(value => subscriber.next(value))
			.catch(error => {
				promise = undefined
				subscriber.error(error)
			})
	})
}

*/
