import { Connector } from "./connector"
import { useRxOrThrow } from "@rixio/react"

export function useConnector<Option, Connection>(connector: Connector<Option, Connection>) {
	const connection = useRxOrThrow(connector.connection)
	return { connection, connect: connector.connect }
}
