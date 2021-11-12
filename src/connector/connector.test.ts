import type { Observable } from "rxjs"
import { BehaviorSubject, of } from "rxjs"
import { filter, first, map } from "rxjs/operators"
import type { ConnectionProvider } from "./provider"
import { ConnectorImpl } from "./connector"

describe("Connector", () => {
	test("should return options", async () => {
		const connector = ConnectorImpl.create(test1).add(test2)
		expect(await connector.options).toStrictEqual([
			{ provider: test1, option: "test1-op1" },
			{ provider: test2, option: "test2-op1" },
		])
	})

	test("should not allow to connect if other connected", async () => {
		const conn1 = new BehaviorSubject<string | undefined>("connected")
		const p1 = createTestProvider(conn1)
		const conn2 = new BehaviorSubject<string | undefined>(undefined)
		const p2 = createTestProvider(conn2)

		const connector = ConnectorImpl.create(p1).add(p2)
		const [opt1, opt2] = await connector.options
		connector.connect(opt1)
		expect(() => connector.connect(opt2)).toThrow()

		conn1.next(undefined)
		expect(() => connector.connect(opt2)).not.toThrow()
		expect(() => connector.connect(opt2)).not.toThrow()
	})

	test("provider can be auto-connected", async () => {
		const test1AutoConnected = {
			...test1,
			isAutoConnected: Promise.resolve(true),
		}
		const connector = ConnectorImpl.create(test1AutoConnected).add(test2)
		const connected = await connector.connection.pipe(
			filter(it => it !== undefined),
			first()
		).toPromise()
		expect(connected).toStrictEqual({ status: "connected", connection: "connected" })
	})
})

const test1: ConnectionProvider<"test1-op1" | "test1-op2", string> = {
	option: Promise.resolve("test1-op1"),
	connection: of({ status: "connected", connection: "connected" }),
	isAutoConnected: Promise.resolve(false),
}

const test2: ConnectionProvider<"test2-op1", number> = {
	option: Promise.resolve("test2-op1"),
	connection: of({ status: "connected", connection: 1 }),
	isAutoConnected: Promise.resolve(false),
}

function createTestProvider(connection: Observable<string | undefined>): ConnectionProvider<"option", string> {
	return {
		option: Promise.resolve("option"),
		connection: connection.pipe(map(it => it ? { status: "connected", connection: it } : undefined)),
		isAutoConnected: Promise.resolve(false),
	}
}
