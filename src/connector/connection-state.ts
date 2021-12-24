
export type StateConnected<T> = {
	status: "connected"
	connection: T
	disconnect?: () => Promise<void>
}

export type StateConnecting = {
	status: "connecting"
	providerId: string,
}

export type StateInitializing = {
	status: "initializing"
}

export type StateDisconnected = {
	status: "disconnected"
}

export const STATE_DISCONNECTED: StateDisconnected = { status: "disconnected" }
export const STATE_INITIALIZING: StateInitializing = { status: "initializing" }

export function getStateConnected<T>(connection: T, disconnect: () => Promise<void>): StateConnected<T> {
	return { status: "connected", connection, disconnect }
}

export function getStateConnecting(providerId: string): StateConnecting {
	return { status: "connecting", providerId }
}

export type ConnectionState<T> = StateConnected<T> | StateConnecting | StateInitializing | StateDisconnected