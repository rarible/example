import type { Observable } from "rxjs"
import { BehaviorSubject, of } from "rxjs"
import { distinctUntilChanged, mergeMap, shareReplay } from "rxjs/operators"
import type { ConnectionProvider, ConnectionState } from "./provider"

export type ProviderOption<Option, Connection> = {
	provider: ConnectionProvider<Option, Connection>
	option: Option
}

export type Connector<Option, Connection> = {
	/**
	 * Get all available connection options (Metamask, Fortmatic, Blocto, Temple etc)
	 */
	options: Promise<ProviderOption<Option, Connection>[]>
	/**
	 * Connect using specific option
	 */
	connect(option: ProviderOption<Option, Connection>): void
	/**
	 * Subscribe to this observable to get current connection state
	 */
	connection: Observable<ConnectionState<Connection>>
}

export class ConnectorImpl<Option, Connection> implements Connector<Option, Connection> {
	private readonly provider = new BehaviorSubject<ConnectionProvider<Option, Connection> | undefined>(undefined)
	readonly connection: Observable<ConnectionState<Connection>>
	readonly close: () => void

	constructor(
		private readonly providers: ConnectionProvider<Option, Connection>[],
	) {
		this.add = this.add.bind(this)
		this.connect = this.connect.bind(this)

		this.connection = this.provider.pipe(
			distinctUntilChanged(),
			mergeMap(p => p ? p.getConnection() : of(undefined)),
			shareReplay(1),
		)
		const sub = this.connection.subscribe(c => {
			if (c === undefined) {
				this.provider.next(undefined)
			}
		})
		this.close = sub.unsubscribe
		this.checkAutoConnect().then()
	}

	add<NewOption, NewConnection>(provider: ConnectionProvider<Option | NewOption, Connection | NewConnection>) {
		return new ConnectorImpl([...this.providers, provider])
	}

	static create<Option, Connection>(
		provider: ConnectionProvider<Option, Connection>,
	): ConnectorImpl<Option, Connection> {
		return new ConnectorImpl([provider])
	}

	private async checkAutoConnect() {
		const promises = this.providers.map(it => ({ provider: it, autoConnected: it.isAutoConnected() }))
		for (const { provider, autoConnected } of promises) {
			const value = await autoConnected
			if (value) {
				this.provider.next(provider)
				return
			}
		}
	}

	get options(): Promise<ProviderOption<Option, Connection>[]> {
		return this.getOptions()
	}

	private async getOptions(): Promise<ProviderOption<Option, Connection>[]> {
		const result: ProviderOption<Option, Connection>[] = []
		for (const pair of this.providers.map(it => ({ provider: it, option: it.getOption() }))) {
			const { provider, option } = pair
			const opt = await option
			if (opt) {
				result.push({ provider, option: opt })
			}
		}
		return result
	}

	connect(option: ProviderOption<Option, Connection>): void {
		const connected = this.provider.value
		if (connected !== undefined) {
			throw new Error(`Provider ${connected} already connected`)
		}
		this.provider.next(option.provider)
	}
}
