import { TezosToolkit } from "@taquito/taquito"
import { TempleWallet } from "@temple-wallet/dapp"

export type TezosWallet = {
	toolkit: TezosToolkit
	wallet: TempleWallet
	address: string
}