import { Connector } from "./connector"
import { Rx, useRxOrThrow } from "@rixio/react"
import { useMemo } from "react"
import { from } from "rxjs"

export type ConnectorComponentProps<Connection> = {
	connector: Connector<string, Connection>
	children: (connection: Connection) => JSX.Element
}

export function ConnectorComponent<Connection>({ connector, children }: ConnectorComponentProps<Connection>) {
	const conn = useRxOrThrow(connector.connection)
	if (conn.status === "disconnected") {
		return <Options connector={connector}/>
	} else if (conn.status === "connecting") {
		return <p>Connecting...</p>
	} else if (conn.status === "initializing") {
		return <p>Initializing...</p>
	} else {
		console.log("Connected:", conn.disconnect)
		return (
			<div>
				{conn.disconnect && <button onClick={conn.disconnect}>disconnect</button>}
				{children(conn.connection)}
			</div>
		)
	}
}

function Options<C>({ connector }: { connector: Connector<string, C> }) {
	const options$ = useMemo(() => from(connector.options), [connector])
	return <Rx value$={options$}>{options => (
		<div>
			<p>Connect to:</p>
			{options.map(o => <div key={o.option}>
				<button onClick={() => connector.connect(o)}>{o.option}</button>
			</div>)}
		</div>
	)}</Rx>
}
