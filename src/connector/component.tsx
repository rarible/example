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
	if (conn === undefined) {
		return <Options connector={connector}/>
	} else if (conn.status === "connecting") {
		return <p>Connecting...</p>
	} else if (conn.status === "initializing") {
		return <p>Initializing...</p>
	} else {
		return children(conn.connection)
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
