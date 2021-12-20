import type { Observable } from "rxjs"
import { BehaviorSubject, of, Subscription } from "rxjs"
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

/**
 * This component is used to save/load last connected provider
 */
export interface ConnectorState {
	getValue(): Promise<string | undefined>
	setValue(value: string | undefined): Promise<void>
}

export class ConnectorImpl<Option, Connection> implements Connector<Option, Connection> {
	private readonly provider = new BehaviorSubject<ConnectionProvider<Option, Connection> | undefined>(undefined)
	private sub: Subscription | undefined = undefined
	readonly connection: Observable<ConnectionState<Connection>>

	constructor(
		private readonly providers: ConnectionProvider<Option, Connection>[],
		private readonly state?: ConnectorState
	) {
		this.add = this.add.bind(this)
		this.connect = this.connect.bind(this)

		this.connection = this.provider.pipe(
			distinctUntilChanged(),
			mergeMap(p => p ? p.getConnection() : of(undefined)),
			shareReplay(1),
		)
		this.close = () => {}
		// this.close = sub.unsubscribe
		this.checkAutoConnect().then(() => {
			this.sub = this.connection.subscribe(async c => {
				if (c === undefined) {
					this.provider.next(undefined)
					const current = await this.state?.getValue()
					if (current !== undefined) {
						console.log("setting undefined")
						this.state?.setValue(undefined)
					}
				}
			})
		})
	}

	close() {
		if (this.sub !== undefined) {
			this.sub.unsubscribe()
		}
	}

	add<NewOption, NewConnection>(provider: ConnectionProvider<Option | NewOption, Connection | NewConnection>) {
		return new ConnectorImpl([...this.providers, provider], this.state)
	}

	static create<Option, Connection>(
		provider: ConnectionProvider<Option, Connection>,
		state?: ConnectorState,
	): ConnectorImpl<Option, Connection> {
		return new ConnectorImpl([provider], state)
	}

	private async checkAutoConnect() {
		const promises = this.providers.map(it => ({ provider: it, autoConnected: it.isAutoConnected() }))
		for (const { provider, autoConnected } of promises) {
			const value = await autoConnected
			if (value) {
				this.provider.next(provider)
				this.state?.setValue(provider.getId())
				return
			}
		}
		const selected = await this.state?.getValue()
		if (selected !== undefined) {
			for (const provider of this.providers) {
				if (selected === provider.getId()) {
					if (await provider.isConnected()) {
						this.provider.next(provider)
					} else {
						this.state?.setValue(undefined)
					}
					return
				}
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
		this.state?.setValue(option.provider.getId())
	}
}
