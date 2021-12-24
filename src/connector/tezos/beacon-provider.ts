import type { OpKind, OriginateParams, TezosToolkit, TransferParams } from "@taquito/taquito"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
import type { TempleWallet } from "@temple-wallet/dapp"
import { BeaconWallet } from "@taquito/beacon-wallet"

export async function beaconProvider(wallet: BeaconWallet, tk: TezosToolkit): Promise<TezosProvider> {
	const { beacon_provider: createBeaconProvider } = await import(
		"tezos-sdk-module/dist/providers/beacon/beacon_provider"
		)

	return createBeaconProvider(wallet, tk)
}
