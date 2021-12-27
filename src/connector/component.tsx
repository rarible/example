import { Connector } from "./connector"
import { Rx, useRxOrThrow } from "@rixio/react"
import { useMemo } from "react"
import { from } from "rxjs"
import { ConnectionState } from "./connection-state"

export type ConnectorComponentProps<Connection> = {
	connector: Connector<string, Connection>
	children: (connection: Connection) => JSX.Element
}

export function ConnectorComponent<Connection>({ connector, children }: ConnectorComponentProps<Connection>) {
	const conn = useRxOrThrow(connector.connection)
	if (conn.status === "disconnected" || conn.status === "connecting") {
		return <Options connector={connector} connectionState={conn}/>
	} else if (conn.status === "initializing") {
		return <p>Initializing...</p>
	} else {
		return (
			<div>
				{conn.disconnect && <button onClick={conn.disconnect}>disconnect</button>}
				{children(conn.connection)}
			</div>
		)
	}
}

interface OptionsProps<C> {
	connector: Connector<string, C>
	connectionState: ConnectionState<C>
}

function Options<C>({ connector, connectionState }: OptionsProps<C>) {
	const options$ = useMemo(() => from(connector.options), [connector])
	return <Rx value$={options$}>{options => (
		<div>
			<p>Connect to:</p>
			{options.map(o => <div key={o.option}>
				<button onClick={() => connector.connect(o)}>{o.option}</button>
				{connectionState.status === "connecting" && connectionState.providerId === o.provider.getId() ? "Connecting..." : null}
			</div>)}
		</div>
	)}</Rx>
}
