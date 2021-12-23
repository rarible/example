import type { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { Maybe } from "../common/maybe"

export type StateConnected<T> = {
	status: "connected"
	connection: T
	disconnect?: () => Promise<void>
}

export type StateConnecting = {
	status: "connecting"
}

export type StateInitializing = {
	status: "initializing"
}

export type StateDisconnected = {
	status: "disconnected"
}

export const STATE_CONNECTING: StateConnecting = { status: "connecting" }
export const STATE_DISCONNECTED: StateDisconnected = { status: "disconnected" }
export const STATE_INITIALIZING: StateInitializing = { status: "initializing" }

export type ConnectionState<T> = StateConnected<T> | StateConnecting | StateInitializing | StateDisconnected

/**
 * Provider of the connection.
 * Examples: injected web3, fortmatic, temple tezos wallet, blocto.
 */
export type ConnectionProvider<Option, Connection> = {
	/**
	 * Returns unique identifier of the connection provider. It's used to save/load last connected provider
	 */
	getId(): string

	/**
	 * Checks if this provider is auto-connected. For example, injected mobile providers are connected by default
	 */
	isAutoConnected(): Promise<boolean>
	/**
	 * List of available connection options: injected web3 can find out what option is available (Metamask, Trust etc.)
	 */
	getOption(): Promise<Maybe<Option>>
	/**
	 * Current connection state. If value is undefined, then provider is considered disconnected.
	 */
	getConnection(): Observable<ConnectionState<Connection>>
	/**
	 * Checks if provider can establish connection without asking user permission (if session is not expired)
	 */
	isConnected(): Promise<boolean>
}

export abstract class AbstractConnectionProvider<O, C> implements ConnectionProvider<O, C> {
	abstract getId(): string

	abstract getConnection(): Observable<ConnectionState<C>>

	abstract getOption(): Promise<Maybe<O>>

	abstract isAutoConnected(): Promise<boolean>

	abstract isConnected(): Promise<boolean>

	map<NewConnection>(mapper: (c: C) => NewConnection): ConnectionProvider<O, NewConnection> {
		return new MappedConnectionProvider(this, mapper)
	}

	mapOption<NewOption>(mapper: (o: O) => NewOption): ConnectionProvider<NewOption, C> {
		return new MappedOptionConnectionProvider(this, mapper)
	}
}

class MappedOptionConnectionProvider<O, C, NewO> extends AbstractConnectionProvider<NewO, C> {
	constructor(
		private readonly source: ConnectionProvider<O, C>,
		private readonly mapper: (from: O) => NewO,
	) {
		super()
	}

	getId(): string {
		return this.source.getId()
	}

	getConnection(): Observable<ConnectionState<C>> {
		return this.source.getConnection()
	}

	isAutoConnected() {
		return this.source.isAutoConnected()
	}

	async getOption() {
		const sourceOption = await this.source.getOption()
		return sourceOption ? this.mapper(sourceOption) : undefined
	}

	isConnected(): Promise<boolean> {
		return this.source.isConnected()
	}
}

class MappedConnectionProvider<O, Connection, NewConnection> extends AbstractConnectionProvider<O, NewConnection> {
	constructor(
		private readonly source: ConnectionProvider<O, Connection>,
		private readonly mapper: (from: Connection) => NewConnection
	) {
		super()
	}

	getId(): string {
		return this.source.getId()
	}

	getConnection(): Observable<ConnectionState<NewConnection>> {
		return this.source.getConnection().pipe(map(state => {
			if (state.status === "connected") {
				return { status: "connected" as const, connection: this.mapper(state.connection), disconnect: state.disconnect }
			} else {
				return state
			}
		}))
	}

	isAutoConnected() {
		return this.source.isAutoConnected()
	}

	getOption() {
		return this.source.getOption()
	}

	isConnected(): Promise<boolean> {
		return this.source.isConnected()
	}
}

