import type { Observable } from "rxjs"
import { BehaviorSubject, concat, defer, of } from "rxjs"
import { distinctUntilChanged, mergeMap, shareReplay, tap } from "rxjs/operators"
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
	readonly connection: Observable<ConnectionState<Connection>>

	constructor(
		private readonly providers: ConnectionProvider<Option, Connection>[],
		private readonly state?: ConnectorState
	) {
		this.add = this.add.bind(this)
		this.connect = this.connect.bind(this)

		this.connection = concat(
			of({ status: "initializing" as const }),
			defer(() => this.checkAutoConnect()),
			this.provider.pipe(
				distinctUntilChanged(),
				mergeMap(p => p ? p.getConnection() : of(undefined)),
			)
		).pipe(
			distinctUntilChanged(),
			shareReplay(1),
			tap(async conn => {
				if (conn === undefined) {
					this.provider.next(undefined)
					const current = await this.state?.getValue()
					if (current !== undefined) {
						console.log("setting undefined")
						this.state?.setValue(undefined)
					}
				}
			})
		)
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

	private async checkAutoConnect(): Promise<ConnectionState<Connection>> {
		console.log("Connector initialized. Checking auto-(re)connect")
		const promises = this.providers.map(it => ({ provider: it, autoConnected: it.isAutoConnected() }))
		for (const { provider, autoConnected } of promises) {
			const value = await autoConnected
			if (value) {
				console.log(`Provider ${provider.getId()} is auto-connected`)
				this.provider.next(provider)
				this.state?.setValue(provider.getId())
				return { status: "connecting" }
			}
		}
		const selected = await this.state?.getValue()
		if (selected !== undefined) {
			for (const provider of this.providers) {
				if (selected === provider.getId()) {
					console.log(`Previously connected provider found: ${selected}. checking if is connected`)
					if (await provider.isConnected()) {
						console.log(`Provider ${selected} is connected`)
						this.provider.next(provider)
						return { status: "connecting" }
					} else {
						console.log(`Provider ${selected} is not connected`)
						this.state?.setValue(undefined)
						return undefined
					}
				}
			}
		}
		return undefined
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
		console.log(`Selected ${option.provider.getId()} provider`)
		this.provider.next(option.provider)
		this.state?.setValue(option.provider.getId())
	}
}
