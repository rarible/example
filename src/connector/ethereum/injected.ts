import { combineLatest, defer, from, Observable } from "rxjs"
import { map, mergeMap, startWith } from "rxjs/operators"
import type { ConnectionState } from "../provider"
import { AbstractConnectionProvider } from "../provider"
import { Maybe } from "../../common/maybe"
import { EthereumWallet } from "./domain"
import { promiseToObservable } from "../common/utils";

export class InjectedWeb3ConnectionProvider extends AbstractConnectionProvider<"injected", EthereumWallet> {
	private readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor() {
		super()
		this.connection = defer(() => from(connect())).pipe(
			mergeMap(() => promiseToObservable(getWalletAsync())),
			map(wallet => {
				if (wallet) {
					return { status: "connected" as const, connection: wallet }
				} else {
					return undefined
				}
			}),
			startWith({ status: "connecting" as const }),
		)
	}

	getId(): string {
		return "injected"
	}

	getConnection(): Observable<ConnectionState<EthereumWallet>> {
		return this.connection
	}

	getOption(): Promise<Maybe<"injected">> {
		//todo handle injected provider types (find out what exact provider is used)
		// metamask, dapper etc
		const provider = getInjectedProvider()
		if (provider !== undefined) {
			return Promise.resolve("injected")
		} else {
			return Promise.resolve(undefined)
		}
	}

	isAutoConnected(): Promise<boolean> {
		return Promise.resolve(false)
	}

	async isConnected(): Promise<boolean> {
		const provider = getInjectedProvider()
		if (provider !== undefined) {
			return getAccounts(provider)
				.then(([account]) => account !== undefined)
		} else {
			return Promise.resolve(false)
		}
	}
}

async function connect(): Promise<void> {
	const provider = getInjectedProvider()
	if (!provider) {
		throw new Error("Injected provider not available")
	}
	const accounts = await getAccounts(provider)
	if (!accounts || accounts.length === 0) {
		await enableProvider(provider)
	}
}

async function getWalletAsync(): Promise<Observable<EthereumWallet | undefined>> {
	const provider = getInjectedProvider()
	return combineLatest([getAddress(provider), getChainId(provider)]).pipe(
		map(([address, chainId]) => {
			if (address) {
				return { chainId, address, provider }
			} else {
				return undefined
			}
		}),
	)
}

async function enableProvider(provider: any) {
	if (typeof provider.request === "function") {
		try {
			await provider.request({
				method: "eth_requestAccounts",
			})
		} catch (e) {
			if (typeof provider.enable === "function") {
				await provider.enable()
			}
		}
	} else {
		if (typeof provider.enable === "function") {
			await provider.enable()
		}
	}
	return provider
}

function getAddress(provider: any): Observable<string | undefined> {
	return getObservable<string[], string | undefined>(
		provider,
		getAccounts,
		([account]) => account,
		"accountsChanged",
	)
}

function getChainId(provider: any): Observable<number> {
	return getObservable<string, number>(
		provider,
		ethChainId,
		raw => parseInt(raw),
		"chainChanged",
	)
}

function getObservable<Raw, T>(
	provider: any,
	getRaw: (provider: any) => Promise<Raw>,
	mapRaw: (raw: Raw) => T,
	eventName: string,
): Observable<T> {
	return new Observable<T>(subscriber => {
		const handler = (raw: Raw) => {
			subscriber.next(mapRaw(raw))
		}
		getRaw(provider).then(handler)
		provider.on(eventName, handler) //todo if on not supported poll
		subscriber.add(() => {
			provider.removeListener(eventName, handler)  //todo if removeListener not supported
		})
	})
}

function getInjectedProvider(): any | undefined {
	let provider: any
	if ((window as any).ethereum) {
		provider = (window as any).ethereum
		;(provider as any).autoRefreshOnNetworkChange = false
	} else if ((window as any).web3?.currentProvider) {
		provider = (window as any).web3.currentProvider
	}
	return provider
}

async function getAccounts(provider: any): Promise<string[]> {
	if ("request" in provider) {
		return provider.request({ method: "eth_accounts" })
	} else {
		return []
	}
}

async function ethChainId(provider: any): Promise<string> {
	if ("request" in provider) {
		return provider.request({ method: "eth_chainId" })
	} else {
		throw new Error("Not supported: eth_chainId")
	}
}
