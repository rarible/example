import { AbstractConnectionProvider } from "../provider"
import { defer, Observable } from "rxjs"
import type { TezosToolkit } from "@taquito/taquito"
import type { BeaconWallet } from "@taquito/beacon-wallet"
import { first, mergeMap, startWith } from "rxjs/operators"
import { Maybe } from "../../common/maybe"
import { TezosWallet } from "./domain"
import { cache } from "../common/utils"
import { ConnectionState, getStateConnecting, STATE_DISCONNECTED } from "../connection-state"
import type { NetworkType as TezosNetwork } from "@airgap/beacon-sdk"
import { beaconProvider } from "./beacon-provider"

export type BeaconConfig = {
	appName: string,
	accessNode: string
	network: TezosNetwork
}
const PROVIDER_ID = "beacon" as const

export class BeaconConnectionProvider extends AbstractConnectionProvider<typeof PROVIDER_ID, TezosWallet> {
	private readonly instance: Observable<{ beaconWallet: BeaconWallet, tezosToolkit: TezosToolkit }>
	private readonly connection: Observable<ConnectionState<TezosWallet>>

	constructor(
		private readonly config: BeaconConfig
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = defer(() => this.instance.pipe(
			mergeMap(({ beaconWallet, tezosToolkit }) => {
				return new Observable<ConnectionState<TezosWallet>>(subscriber => {
					const disconnect = async () => {
						await beaconWallet.disconnect()
						await beaconWallet.client.removeAllPeers()
						await beaconWallet.client.removeAllAccounts()
						await beaconWallet.client.destroy()
						subscriber.next(STATE_DISCONNECTED)
					}

					Promise.all([this.getAddress(beaconWallet), beaconProvider(beaconWallet, tezosToolkit)]).then(
						([address, provider]) => {
							subscriber.next({
								status: "connected" as const,
								connection: { address, toolkit: tezosToolkit, wallet: beaconWallet, provider },
								disconnect
							})
						}
					).catch(() => {
						subscriber.next(STATE_DISCONNECTED)
					})
				})
			}),
			startWith(getStateConnecting(PROVIDER_ID)),
		))
	}

	private async getAddress(beaconWallet: BeaconWallet): Promise<string> {
		let address: Promise<string>
		const activeAccount = await beaconWallet.client.getActiveAccount()
		if (activeAccount) {
			address = Promise.resolve(activeAccount.address)
		} else {
			await beaconWallet.requestPermissions({
				network: {
					type: this.config.network,
					rpcUrl: this.config.accessNode,
				},
			})
			address = beaconWallet.getPKH()
		}

		return address
	}

	getId(): string {
		return PROVIDER_ID
	}

	getConnection(): Observable<ConnectionState<TezosWallet>> {
		return this.connection
	}

	private async _connect(): Promise<{ beaconWallet: BeaconWallet, tezosToolkit: TezosToolkit }> {
		const { TezosToolkit } = await import("@taquito/taquito")
		const { BeaconWallet } = await import("@taquito/beacon-wallet")

		const wallet = new BeaconWallet({
			name: this.config.appName,
			preferredNetwork: this.config.network,
		})
		const tk = new TezosToolkit(this.config.accessNode)
		tk.setWalletProvider(wallet)

		return {
			beaconWallet: wallet,
			tezosToolkit: tk
		}
	}

	getOption(): Promise<Maybe<typeof PROVIDER_ID>> {
		return Promise.resolve(PROVIDER_ID)
	}

	isAutoConnected() {
		return Promise.resolve(false)
	}

	async isConnected(): Promise<boolean> {
		const instance = await this.instance.pipe(first()).toPromise()
		return !!(await instance.beaconWallet.getPKH())
	}
}
